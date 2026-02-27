"""
Marathi Speech-to-Speech Bot using Google Cloud APIs
=====================================================

This module implements a complete speech-to-speech conversational bot for Marathi (mr-IN).

Components:
- Ears: Google Cloud Speech-to-Text (Chirp model for Marathi)
- Brain: Google Cloud Dialogflow CX (multilingual agent)  
- Mouth: Google Cloud Text-to-Speech (Neural2 Marathi voices)

Author: Smart Agro Team
"""

import os
import io
import wave
import queue
import threading
import time
from typing import Optional, Generator
from dataclasses import dataclass
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Google Cloud imports
from google.cloud import speech_v1p1beta1 as speech
from google.cloud import texttospeech_v1 as texttospeech
from google.cloud import dialogflowcx_v3 as dialogflow
from google.api_core import exceptions as google_exceptions
from google.api_core import retry

# Audio handling
import pyaudio
import pygame

# ============================================================================
# CONFIGURATION
# ============================================================================

@dataclass
class Config:
    """Configuration settings for the voice bot."""
    
    # Google Cloud Project Settings
    PROJECT_ID: str = os.getenv("GOOGLE_CLOUD_PROJECT", "your-project-id")
    LOCATION: str = os.getenv("DIALOGFLOW_LOCATION", "global")
    AGENT_ID: str = os.getenv("DIALOGFLOW_AGENT_ID", "your-agent-id")
    
    # Audio Settings
    SAMPLE_RATE: int = 16000  # Hz - optimal for speech recognition
    CHANNELS: int = 1        # Mono audio
    CHUNK_SIZE: int = 1024   # Audio buffer size
    AUDIO_FORMAT: int = pyaudio.paInt16
    RECORD_SECONDS: int = 5  # Default recording duration
    
    # Speech-to-Text Settings
    LANGUAGE_CODE: str = "mr-IN"  # Marathi (India)
    STT_MODEL: str = "chirp_2"   # Chirp 2 model for better Marathi accuracy
    
    # Text-to-Speech Settings
    TTS_VOICE: str = "mr-IN-Neural2-A"  # Neural2 Marathi voice
    TTS_SPEAKING_RATE: float = 1.0
    TTS_PITCH: float = 0.0
    
    # Dialogflow CX Session Settings
    SESSION_TTL: int = 3600  # Session timeout in seconds


config = Config()


# ============================================================================
# SPEECH-TO-TEXT (EARS)
# ============================================================================

class SpeechToText:
    """
    Google Cloud Speech-to-Text handler using Chirp model.
    
    Converts Marathi speech audio to text with high accuracy.
    """
    
    def __init__(self):
        """Initialize the Speech-to-Text client."""
        self.client = speech.SpeechClient()
        self.recognition_config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz=config.SAMPLE_RATE,
            language_code=config.LANGUAGE_CODE,
            model=config.STT_MODEL,
            enable_automatic_punctuation=True,
            # Enhanced settings for Marathi
            use_enhanced=True,
            # Alternative language codes for fallback
            alternative_language_codes=["hi-IN", "en-IN"],
        )
        print(f"✓ Speech-to-Text initialized with {config.STT_MODEL} model for {config.LANGUAGE_CODE}")
    
    @retry.Retry(predicate=retry.if_exception_type(
        google_exceptions.ServiceUnavailable,
        google_exceptions.DeadlineExceeded
    ))
    def transcribe_audio(self, audio_content: bytes) -> Optional[str]:
        """
        Transcribe audio bytes to text.
        
        Args:
            audio_content: Raw audio bytes in LINEAR16 format
            
        Returns:
            Transcribed text or None if no speech detected
        """
        try:
            audio = speech.RecognitionAudio(content=audio_content)
            response = self.client.recognize(
                config=self.recognition_config,
                audio=audio
            )
            
            # Extract the transcription
            if response.results:
                transcript = " ".join(
                    result.alternatives[0].transcript 
                    for result in response.results
                )
                confidence = response.results[0].alternatives[0].confidence
                print(f"🎤 Transcribed: '{transcript}' (confidence: {confidence:.2%})")
                return transcript
            
            print("⚠️ No speech detected in audio")
            return None
            
        except google_exceptions.InvalidArgument as e:
            print(f"❌ Invalid audio format: {e}")
            return None
        except google_exceptions.ResourceExhausted as e:
            print(f"❌ API rate limit exceeded: {e}")
            raise
        except Exception as e:
            print(f"❌ Speech-to-Text error: {e}")
            return None
    
    def transcribe_streaming(self, audio_generator: Generator[bytes, None, None]) -> Optional[str]:
        """
        Streaming transcription for real-time speech recognition.
        
        Args:
            audio_generator: Generator yielding audio chunks
            
        Returns:
            Final transcribed text
        """
        streaming_config = speech.StreamingRecognitionConfig(
            config=self.recognition_config,
            interim_results=True,
            single_utterance=True
        )
        
        def request_generator():
            yield speech.StreamingRecognizeRequest(streaming_config=streaming_config)
            for chunk in audio_generator:
                yield speech.StreamingRecognizeRequest(audio_content=chunk)
        
        try:
            responses = self.client.streaming_recognize(request_generator())
            
            final_transcript = ""
            for response in responses:
                for result in response.results:
                    if result.is_final:
                        final_transcript += result.alternatives[0].transcript
                        print(f"🎤 Final: '{result.alternatives[0].transcript}'")
                    else:
                        print(f"🎤 Interim: '{result.alternatives[0].transcript}'")
            
            return final_transcript if final_transcript else None
            
        except Exception as e:
            print(f"❌ Streaming transcription error: {e}")
            return None


# ============================================================================
# DIALOGFLOW CX (BRAIN)
# ============================================================================

class DialogflowCXAgent:
    """
    Google Cloud Dialogflow CX handler.
    
    Processes natural language queries and generates intelligent responses.
    Note: Using Dialogflow CX (not legacy ES version) as required.
    """
    
    def __init__(self):
        """Initialize the Dialogflow CX client."""
        self.client = dialogflow.SessionsClient()
        self.agent_path = f"projects/{config.PROJECT_ID}/locations/{config.LOCATION}/agents/{config.AGENT_ID}"
        self.session_id = self._generate_session_id()
        self.session_path = f"{self.agent_path}/sessions/{self.session_id}"
        print(f"✓ Dialogflow CX Agent initialized")
        print(f"  Agent: {self.agent_path}")
        print(f"  Session: {self.session_id}")
    
    def _generate_session_id(self) -> str:
        """Generate a unique session ID."""
        import uuid
        return str(uuid.uuid4())
    
    def reset_session(self):
        """Start a new conversation session."""
        self.session_id = self._generate_session_id()
        self.session_path = f"{self.agent_path}/sessions/{self.session_id}"
        print(f"🔄 New session started: {self.session_id}")
    
    @retry.Retry(predicate=retry.if_exception_type(
        google_exceptions.ServiceUnavailable,
        google_exceptions.DeadlineExceeded
    ))
    def detect_intent(self, text: str, language_code: str = None) -> Optional[str]:
        """
        Send text to Dialogflow CX and get response.
        
        Args:
            text: User's text input
            language_code: Override language code (default: config.LANGUAGE_CODE)
            
        Returns:
            Bot's response text or None on error
        """
        if not text:
            return None
        
        lang = language_code or config.LANGUAGE_CODE
        
        try:
            # Create text input
            text_input = dialogflow.TextInput(text=text)
            query_input = dialogflow.QueryInput(
                text=text_input,
                language_code=lang
            )
            
            # Create the request
            request = dialogflow.DetectIntentRequest(
                session=self.session_path,
                query_input=query_input
            )
            
            # Send request
            response = self.client.detect_intent(request=request)
            
            # Extract response text
            response_messages = response.query_result.response_messages
            response_texts = []
            
            for message in response_messages:
                if message.text:
                    response_texts.extend(message.text.text)
            
            if response_texts:
                bot_response = " ".join(response_texts)
                print(f"🤖 Bot response: '{bot_response}'")
                return bot_response
            
            print("⚠️ No response from Dialogflow")
            return None
            
        except google_exceptions.NotFound as e:
            print(f"❌ Dialogflow agent not found: {e}")
            print("  Please check your PROJECT_ID, LOCATION, and AGENT_ID")
            return None
        except google_exceptions.PermissionDenied as e:
            print(f"❌ Permission denied: {e}")
            print("  Please check your service account permissions")
            return None
        except Exception as e:
            print(f"❌ Dialogflow error: {e}")
            return None


# ============================================================================
# TEXT-TO-SPEECH (MOUTH)
# ============================================================================

class TextToSpeech:
    """
    Google Cloud Text-to-Speech handler.
    
    Converts text to natural-sounding Marathi speech using Neural2 voices.
    """
    
    def __init__(self):
        """Initialize the Text-to-Speech client."""
        self.client = texttospeech.TextToSpeechClient()
        
        # Voice configuration
        self.voice = texttospeech.VoiceSelectionParams(
            language_code=config.LANGUAGE_CODE,
            name=config.TTS_VOICE
        )
        
        # Audio configuration
        self.audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
            speaking_rate=config.TTS_SPEAKING_RATE,
            pitch=config.TTS_PITCH,
            effects_profile_id=["small-bluetooth-speaker-class-device"]
        )
        
        # Initialize pygame for audio playback
        pygame.mixer.init()
        
        print(f"✓ Text-to-Speech initialized with voice {config.TTS_VOICE}")
    
    def list_available_voices(self, language_code: str = "mr-IN") -> list:
        """List all available voices for a language."""
        try:
            response = self.client.list_voices(language_code=language_code)
            voices = []
            for voice in response.voices:
                voices.append({
                    "name": voice.name,
                    "gender": texttospeech.SsmlVoiceGender(voice.ssml_gender).name,
                    "sample_rate": voice.natural_sample_rate_hertz
                })
                print(f"  - {voice.name} ({texttospeech.SsmlVoiceGender(voice.ssml_gender).name})")
            return voices
        except Exception as e:
            print(f"❌ Error listing voices: {e}")
            return []
    
    @retry.Retry(predicate=retry.if_exception_type(
        google_exceptions.ServiceUnavailable,
        google_exceptions.DeadlineExceeded
    ))
    def synthesize_speech(self, text: str) -> Optional[bytes]:
        """
        Convert text to speech audio.
        
        Args:
            text: Text to convert to speech
            
        Returns:
            Audio bytes in MP3 format or None on error
        """
        if not text:
            return None
        
        try:
            # Create synthesis input
            synthesis_input = texttospeech.SynthesisInput(text=text)
            
            # Perform synthesis
            response = self.client.synthesize_speech(
                input=synthesis_input,
                voice=self.voice,
                audio_config=self.audio_config
            )
            
            print(f"🔊 Synthesized {len(response.audio_content)} bytes of audio")
            return response.audio_content
            
        except google_exceptions.InvalidArgument as e:
            print(f"❌ Invalid text input: {e}")
            return None
        except Exception as e:
            print(f"❌ Text-to-Speech error: {e}")
            return None
    
    def speak(self, text: str, wait: bool = True) -> bool:
        """
        Convert text to speech and play it through speakers.
        
        Args:
            text: Text to speak
            wait: Whether to wait for audio to finish playing
            
        Returns:
            True if successful, False otherwise
        """
        audio_content = self.synthesize_speech(text)
        
        if not audio_content:
            return False
        
        try:
            # Save to temporary file and play
            temp_file = "/tmp/tts_output.mp3"
            with open(temp_file, "wb") as f:
                f.write(audio_content)
            
            # Play audio using pygame
            pygame.mixer.music.load(temp_file)
            pygame.mixer.music.play()
            
            if wait:
                # Wait for playback to complete
                while pygame.mixer.music.get_busy():
                    time.sleep(0.1)
            
            print("🔊 Audio playback complete")
            return True
            
        except Exception as e:
            print(f"❌ Audio playback error: {e}")
            return False


# ============================================================================
# AUDIO RECORDER
# ============================================================================

class AudioRecorder:
    """
    Handles microphone audio capture using PyAudio.
    
    Supports both fixed-duration and voice-activity-detection recording.
    """
    
    def __init__(self):
        """Initialize the audio recorder."""
        self.audio = pyaudio.PyAudio()
        self.stream = None
        self.is_recording = False
        self.audio_queue = queue.Queue()
        print("✓ Audio recorder initialized")
    
    def get_device_info(self):
        """List all available audio input devices."""
        print("\n📱 Available audio input devices:")
        for i in range(self.audio.get_device_count()):
            device_info = self.audio.get_device_info_by_index(i)
            if device_info["maxInputChannels"] > 0:
                print(f"  [{i}] {device_info['name']}")
        print()
    
    def record_audio(self, duration: int = None) -> bytes:
        """
        Record audio from the default microphone.
        
        Args:
            duration: Recording duration in seconds (default: config.RECORD_SECONDS)
            
        Returns:
            Raw audio bytes in LINEAR16 format
        """
        duration = duration or config.RECORD_SECONDS
        
        print(f"🎙️ Recording for {duration} seconds... (speak now)")
        
        # Open audio stream
        stream = self.audio.open(
            format=config.AUDIO_FORMAT,
            channels=config.CHANNELS,
            rate=config.SAMPLE_RATE,
            input=True,
            frames_per_buffer=config.CHUNK_SIZE
        )
        
        frames = []
        total_chunks = int(config.SAMPLE_RATE / config.CHUNK_SIZE * duration)
        
        for _ in range(total_chunks):
            data = stream.read(config.CHUNK_SIZE, exception_on_overflow=False)
            frames.append(data)
        
        stream.stop_stream()
        stream.close()
        
        print("🎙️ Recording complete")
        
        # Combine frames into single byte string
        return b''.join(frames)
    
    def start_streaming(self) -> Generator[bytes, None, None]:
        """
        Start streaming audio capture.
        
        Yields:
            Audio chunks as they are captured
        """
        self.is_recording = True
        
        stream = self.audio.open(
            format=config.AUDIO_FORMAT,
            channels=config.CHANNELS,
            rate=config.SAMPLE_RATE,
            input=True,
            frames_per_buffer=config.CHUNK_SIZE,
            stream_callback=self._audio_callback
        )
        
        stream.start_stream()
        print("🎙️ Streaming started... (press Ctrl+C to stop)")
        
        try:
            while self.is_recording:
                try:
                    chunk = self.audio_queue.get(timeout=0.1)
                    yield chunk
                except queue.Empty:
                    continue
        finally:
            stream.stop_stream()
            stream.close()
    
    def _audio_callback(self, in_data, frame_count, time_info, status):
        """PyAudio callback for streaming audio capture."""
        if self.is_recording:
            self.audio_queue.put(in_data)
        return (None, pyaudio.paContinue)
    
    def stop_streaming(self):
        """Stop streaming audio capture."""
        self.is_recording = False
    
    def cleanup(self):
        """Release audio resources."""
        self.audio.terminate()
        print("✓ Audio resources released")


# ============================================================================
# MAIN VOICE BOT ORCHESTRATOR
# ============================================================================

class MarathiVoiceBot:
    """
    Main orchestrator for the Marathi speech-to-speech bot.
    
    Coordinates:
    - Audio capture (microphone)
    - Speech-to-Text (transcription)
    - Dialogflow CX (intent detection & response)
    - Text-to-Speech (voice synthesis)
    """
    
    def __init__(self):
        """Initialize all bot components."""
        print("\n" + "="*60)
        print("   🌾 Smart Agro - Marathi Voice Assistant")
        print("="*60 + "\n")
        
        # Initialize components
        self.recorder = AudioRecorder()
        self.stt = SpeechToText()
        self.dialogflow = DialogflowCXAgent()
        self.tts = TextToSpeech()
        
        print("\n✓ All components initialized successfully!\n")
    
    def process_speech(self, audio_bytes: bytes) -> Optional[str]:
        """
        Process speech audio through the full pipeline.
        
        Args:
            audio_bytes: Raw audio in LINEAR16 format
            
        Returns:
            Bot's spoken response text or None
        """
        # Step 1: Transcribe speech to text
        user_text = self.stt.transcribe_audio(audio_bytes)
        if not user_text:
            self.tts.speak("माफ करा, मला तुमचे बोलणे समजले नाही. कृपया पुन्हा बोला.")
            return None
        
        # Step 2: Get response from Dialogflow CX
        bot_response = self.dialogflow.detect_intent(user_text)
        if not bot_response:
            bot_response = "माफ करा, मला याचे उत्तर माहित नाही."
        
        # Step 3: Speak the response
        self.tts.speak(bot_response)
        
        return bot_response
    
    def run_conversation(self):
        """
        Run an interactive voice conversation loop.
        
        Press Ctrl+C to exit.
        """
        print("\n" + "-"*40)
        print("Voice Conversation Mode")
        print("Press Enter to speak, type 'quit' to exit")
        print("-"*40 + "\n")
        
        # Initial greeting
        greeting = "नमस्कार! मी तुमचा शेती सहाय्यक आहे. मी तुम्हाला कसे मदत करू शकतो?"
        print(f"🤖 Bot: {greeting}")
        self.tts.speak(greeting)
        
        while True:
            try:
                user_input = input("\n[Press Enter to speak or type 'quit']: ").strip()
                
                if user_input.lower() == 'quit':
                    farewell = "धन्यवाद! पुन्हा भेटू."
                    print(f"🤖 Bot: {farewell}")
                    self.tts.speak(farewell)
                    break
                
                # Record user's speech
                audio_data = self.recorder.record_audio(duration=5)
                
                # Process through pipeline
                self.process_speech(audio_data)
                
            except KeyboardInterrupt:
                print("\n\n👋 Conversation ended by user")
                break
            except Exception as e:
                print(f"❌ Error: {e}")
                continue
        
        # Cleanup
        self.cleanup()
    
    def cleanup(self):
        """Release all resources."""
        self.recorder.cleanup()
        print("\n✓ Voice bot shutdown complete")


# ============================================================================
# SIMPLE FALLBACK BOT (Without Dialogflow)
# ============================================================================

class SimpleMarathiBot:
    """
    A simpler version that works without Dialogflow CX.
    
    Uses predefined responses for agricultural queries.
    """
    
    RESPONSES = {
        "नमस्कार": "नमस्कार! मी तुमचा शेती सहाय्यक आहे.",
        "हवामान": "आज हवामान चांगले आहे. तापमान ३२ अंश सेल्सियस आहे.",
        "पीक": "या हंगामात तांदूळ, गहू आणि कापूस लागवडीसाठी योग्य आहेत.",
        "पाणी": "आजच्या हवामानानुसार, संध्याकाळी पाणी द्या.",
        "रोग": "पिकावर रोग आढळल्यास, तज्ञांशी संपर्क साधा.",
        "बाजार": "आजचा सोयाबीनचा भाव ५०००₹ प्रति क्विंटल आहे.",
    }
    
    DEFAULT_RESPONSE = "माफ करा, मला तुमचा प्रश्न समजला नाही. कृपया पुन्हा विचारा."
    
    def __init__(self):
        """Initialize simple bot components."""
        print("\n" + "="*60)
        print("   🌾 Smart Agro - Simple Marathi Bot (No Dialogflow)")
        print("="*60 + "\n")
        
        self.recorder = AudioRecorder()
        self.stt = SpeechToText()
        self.tts = TextToSpeech()
        
        print("\n✓ Simple bot initialized!\n")
    
    def get_response(self, text: str) -> str:
        """Get a response based on keywords in the input."""
        text_lower = text.lower()
        
        for keyword, response in self.RESPONSES.items():
            if keyword in text_lower:
                return response
        
        return self.DEFAULT_RESPONSE
    
    def run(self):
        """Run the simple conversation loop."""
        greeting = "नमस्कार! मी तुमचा शेती सहाय्यक आहे."
        print(f"🤖 Bot: {greeting}")
        self.tts.speak(greeting)
        
        while True:
            try:
                input("\n[Press Enter to speak]: ")
                
                audio_data = self.recorder.record_audio(duration=5)
                user_text = self.stt.transcribe_audio(audio_data)
                
                if user_text:
                    print(f"👤 You: {user_text}")
                    response = self.get_response(user_text)
                    print(f"🤖 Bot: {response}")
                    self.tts.speak(response)
                
            except KeyboardInterrupt:
                print("\n\n👋 Goodbye!")
                break
        
        self.recorder.cleanup()


# ============================================================================
# ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    import sys
    
    print("""
    ╔══════════════════════════════════════════════════════════╗
    ║        🌾 Smart Agro - Marathi Voice Bot 🎤              ║
    ╠══════════════════════════════════════════════════════════╣
    ║  Options:                                                ║
    ║    1. Full bot (with Dialogflow CX)                      ║
    ║    2. Simple bot (keyword-based, no Dialogflow)          ║
    ║    3. Test Text-to-Speech only                           ║
    ║    4. Test Speech-to-Text only                           ║
    ║    5. List available voices                              ║
    ╚══════════════════════════════════════════════════════════╝
    """)
    
    choice = input("Enter your choice (1-5): ").strip()
    
    if choice == "1":
        # Full bot with Dialogflow CX
        bot = MarathiVoiceBot()
        bot.run_conversation()
        
    elif choice == "2":
        # Simple keyword-based bot
        bot = SimpleMarathiBot()
        bot.run()
        
    elif choice == "3":
        # Test TTS only
        tts = TextToSpeech()
        test_text = "नमस्कार! मी तुमचा शेती सहाय्यक आहे. आज हवामान कसे आहे?"
        print(f"Testing TTS with: '{test_text}'")
        tts.speak(test_text)
        
    elif choice == "4":
        # Test STT only
        recorder = AudioRecorder()
        stt = SpeechToText()
        print("Testing Speech-to-Text...")
        audio = recorder.record_audio(duration=5)
        text = stt.transcribe_audio(audio)
        print(f"Transcribed: {text}")
        recorder.cleanup()
        
    elif choice == "5":
        # List voices
        tts = TextToSpeech()
        print("\n🎤 Available Marathi voices:")
        tts.list_available_voices("mr-IN")
        print("\n🎤 Available Hindi voices:")
        tts.list_available_voices("hi-IN")
        
    else:
        print("Invalid choice. Exiting.")
