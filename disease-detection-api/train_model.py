"""
Simplified training script for Plant Disease Detection Model
Uses transfer learning with ResNet18 pretrained on ImageNet
"""

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, random_split
from torchvision import models, transforms, datasets
import os
import zipfile
import requests
from tqdm import tqdm
import time

# Configuration
BATCH_SIZE = 32
EPOCHS = 10
LEARNING_RATE = 0.001
NUM_WORKERS = 2
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Disease classes (39 classes from PlantVillage) - dynamically set from dataset
DISEASE_CLASSES = None  # Will be set from dataset
NUM_CLASSES = None  # Will be set from dataset


def download_dataset():
    """Download PlantVillage dataset from Mendeley"""
    dataset_path = "Plant_leave_diseases_dataset_without_augmentation"
    
    if os.path.exists(dataset_path):
        print(f"Dataset already exists at {dataset_path}")
        return dataset_path
    
    print("Downloading PlantVillage dataset...")
    url = 'https://data.mendeley.com/public-files/datasets/tywbtsjrjv/files/d5652a28-c1d8-4b76-97f3-72fb80f94efc/file_downloaded'
    
    try:
        response = requests.get(url, stream=True, timeout=300)
        total_size = int(response.headers.get('content-length', 0))
        
        with open('data.zip', 'wb') as f:
            with tqdm(total=total_size, unit='B', unit_scale=True, desc='Downloading') as pbar:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
                    pbar.update(len(chunk))
        
        print("Extracting dataset...")
        with zipfile.ZipFile('data.zip', 'r') as f:
            f.extractall()
        
        os.remove('data.zip')
        print(f"Dataset extracted to {dataset_path}")
        return dataset_path
        
    except Exception as e:
        print(f"Error downloading dataset: {e}")
        print("\nPlease download the PlantVillage dataset manually from:")
        print("https://data.mendeley.com/datasets/tywbtsjrjv/1")
        print(f"Extract it to: {dataset_path}")
        return None


def create_model(num_classes, pretrained=True):
    """Create ResNet18 model with transfer learning"""
    if pretrained:
        model = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)
    else:
        model = models.resnet18(weights=None)
    
    # Freeze early layers for transfer learning
    for param in list(model.parameters())[:-10]:
        param.requires_grad = False
    
    # Replace final fully connected layer
    num_features = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Dropout(0.5),
        nn.Linear(num_features, num_classes)
    )
    
    return model


def get_transforms():
    """Get training and validation transforms"""
    train_transform = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.RandomCrop(224),
        transforms.RandomHorizontalFlip(),
        transforms.RandomVerticalFlip(),
        transforms.RandomRotation(30),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    val_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    return train_transform, val_transform


def train_epoch(model, dataloader, criterion, optimizer, device):
    """Train for one epoch"""
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0
    
    pbar = tqdm(dataloader, desc='Training')
    for inputs, labels in pbar:
        inputs, labels = inputs.to(device), labels.to(device)
        
        optimizer.zero_grad()
        outputs = model(inputs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        
        running_loss += loss.item()
        _, predicted = torch.max(outputs.data, 1)
        total += labels.size(0)
        correct += (predicted == labels).sum().item()
        
        pbar.set_postfix({
            'loss': f'{running_loss/total:.4f}',
            'acc': f'{100*correct/total:.2f}%'
        })
    
    return running_loss / len(dataloader), 100 * correct / total


def validate(model, dataloader, criterion, device):
    """Validate the model"""
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0
    
    with torch.no_grad():
        pbar = tqdm(dataloader, desc='Validating')
        for inputs, labels in pbar:
            inputs, labels = inputs.to(device), labels.to(device)
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            
            running_loss += loss.item()
            _, predicted = torch.max(outputs.data, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()
            
            pbar.set_postfix({
                'loss': f'{running_loss/total:.4f}',
                'acc': f'{100*correct/total:.2f}%'
            })
    
    return running_loss / len(dataloader), 100 * correct / total


def main():
    global DISEASE_CLASSES, NUM_CLASSES
    
    print(f"Using device: {DEVICE}")
    
    # Download dataset
    dataset_path = download_dataset()
    if dataset_path is None:
        return
    
    # Create transforms
    train_transform, val_transform = get_transforms()
    
    # Load dataset
    print("Loading dataset...")
    try:
        full_dataset = datasets.ImageFolder(dataset_path, transform=train_transform)
    except Exception as e:
        print(f"Error loading dataset: {e}")
        return
    
    # Set classes dynamically from dataset
    DISEASE_CLASSES = full_dataset.classes
    NUM_CLASSES = len(DISEASE_CLASSES)
    
    print(f"Total images: {len(full_dataset)}")
    print(f"Classes found: {NUM_CLASSES}")
    print(f"Classes: {DISEASE_CLASSES[:5]}... (showing first 5)")
    
    # Save class names for reference
    with open('class_names.txt', 'w') as f:
        for cls in DISEASE_CLASSES:
            f.write(f"{cls}\n")
    
    # Split dataset (80% train, 10% val, 10% test)
    total_size = len(full_dataset)
    train_size = int(0.8 * total_size)
    val_size = int(0.1 * total_size)
    test_size = total_size - train_size - val_size
    
    train_dataset, val_dataset, test_dataset = random_split(
        full_dataset, [train_size, val_size, test_size],
        generator=torch.Generator().manual_seed(42)
    )
    
    # Update val/test transforms (no augmentation)
    val_dataset.dataset.transform = val_transform
    
    print(f"Train: {len(train_dataset)}, Val: {len(val_dataset)}, Test: {len(test_dataset)}")
    
    # Create data loaders
    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=NUM_WORKERS)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=NUM_WORKERS)
    test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=NUM_WORKERS)
    
    # Create model
    print("Creating model with pretrained ImageNet weights...")
    model = create_model(NUM_CLASSES, pretrained=True)
    model = model.to(DEVICE)
    
    # Loss and optimizer
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=LEARNING_RATE)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', factor=0.5, patience=2)
    
    # Training loop
    best_val_acc = 0.0
    print(f"\nStarting training for {EPOCHS} epochs...")
    
    for epoch in range(EPOCHS):
        print(f"\n{'='*50}")
        print(f"Epoch {epoch+1}/{EPOCHS}")
        print(f"{'='*50}")
        
        train_loss, train_acc = train_epoch(model, train_loader, criterion, optimizer, DEVICE)
        val_loss, val_acc = validate(model, val_loader, criterion, DEVICE)
        
        print(f"\nEpoch {epoch+1} Summary:")
        print(f"  Train Loss: {train_loss:.4f}, Train Acc: {train_acc:.2f}%")
        print(f"  Val Loss: {val_loss:.4f}, Val Acc: {val_acc:.2f}%")
        
        scheduler.step(val_loss)
        
        # Save best model
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(model.state_dict(), 'best_model.pth')
            print(f"  Saved best model with val_acc: {val_acc:.2f}%")
    
    # Final test
    print(f"\n{'='*50}")
    print("Testing best model...")
    print(f"{'='*50}")
    
    model.load_state_dict(torch.load('best_model.pth'))
    test_loss, test_acc = validate(model, test_loader, criterion, DEVICE)
    print(f"\nTest Accuracy: {test_acc:.2f}%")
    
    # Save final model
    torch.save(model.state_dict(), 'model.pth')
    print(f"\nModel saved to model.pth")
    print(f"Best validation accuracy: {best_val_acc:.2f}%")
    print(f"Test accuracy: {test_acc:.2f}%")


if __name__ == "__main__":
    main()
