// Test script for audio validation functionality
import fs from 'fs';
import path from 'path';

// Test the AudioValidator class
class AudioValidator {
  static MAX_DURATION_SECONDS = 30;
  static MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  static validateAudioFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return {
          isValid: false,
          error: 'Fichier audio non trouvé'
        };
      }

      const stats = fs.statSync(filePath);
      const fileSize = stats.size;

      if (fileSize > this.MAX_FILE_SIZE) {
        return {
          isValid: false,
          error: `Le fichier audio est trop volumineux (${(fileSize / 1024 / 1024).toFixed(1)}MB). Limite: ${(this.MAX_FILE_SIZE / 1024 / 1024).toFixed(1)}MB`
        };
      }

      return {
        isValid: true,
        duration: Math.ceil(fileSize / (128 * 1024 / 8))
      };
    } catch (error) {
      return {
        isValid: false,
        error: `Erreur lors de la validation du fichier: ${error.message}`
      };
    }
  }

  static isAudioFile(filename) {
    const audioExtensions = ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.webm'];
    const ext = path.extname(filename).toLowerCase();
    return audioExtensions.includes(ext);
  }
}

// Test cases
console.log('🧪 Testing Audio Validation...\n');

// Test 1: Valid audio file extension
console.log('Test 1: Valid audio file extension');
console.log('isAudioFile("test.mp3"):', AudioValidator.isAudioFile('test.mp3'));
console.log('isAudioFile("test.wav"):', AudioValidator.isAudioFile('test.wav'));
console.log('isAudioFile("test.txt"):', AudioValidator.isAudioFile('test.txt'));
console.log('isAudioFile("test.jpg"):', AudioValidator.isAudioFile('test.jpg'));

// Test 2: File size validation
console.log('\nTest 2: File size validation');
const testFilePath = path.join(process.cwd(), 'test-audio.mp3');

// Create a test file (1MB)
if (!fs.existsSync(testFilePath)) {
  // Create a 1MB test file
  const buffer = Buffer.alloc(1024 * 1024, '0');
  fs.writeFileSync(testFilePath, buffer);
  console.log('Created 1MB test file');
}

const validation = AudioValidator.validateAudioFile(testFilePath);
console.log('1MB file validation:', validation);

// Test 3: Non-existent file
console.log('\nTest 3: Non-existent file');
const nonExistentFile = AudioValidator.validateAudioFile('non-existent.mp3');
console.log('Non-existent file validation:', nonExistentFile);

// Test 4: Max duration
console.log('\nTest 4: Max duration');
console.log('Max duration allowed:', AudioValidator.MAX_DURATION_SECONDS, 'seconds');
console.log('Max file size allowed:', (AudioValidator.MAX_FILE_SIZE / 1024 / 1024).toFixed(1), 'MB');

// Cleanup
if (fs.existsSync(testFilePath)) {
  fs.unlinkSync(testFilePath);
  console.log('\n🧹 Cleaned up test file');
}

console.log('\n✅ Audio validation tests completed!');
