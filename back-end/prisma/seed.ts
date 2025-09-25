import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Check if user exists
  let user = await prisma.user.findUnique({
    where: { email: 'bachir12@gmail.com' }
  });

  if (!user) {
    // Hash the password
    const hashedPassword = await bcrypt.hash('775626363', 10);

    // Create the user
    user = await prisma.user.create({
      data: {
        name: 'Bachir',
        email: 'bachir12@gmail.com',
        password: hashedPassword
      }
    });
    console.log('✅ User created with ID:', user.id);
  } else {
    console.log('✅ User already exists with ID:', user.id);
  }

  // Generate 300 tasks with various file types including voice messages
  const tasks = [];
  const audioTypes = ['.mp3', '.wav', '.m4a', '.aac'];
  const audioDescriptions = [
    'Tâche avec note vocale importante',
    'Rappel enregistré pour cette tâche',
    'Instructions audio détaillées',
    'Message vocal de clarification',
    'Note vocale de suivi',
    'Enregistrement de réunion',
    'Commentaire audio personnel'
  ];

  for (let i = 1; i <= 300; i++) {
    const hasImage = i % 10 === 0;
    const hasFile = i % 15 === 0;
    const hasVoice = i % 8 === 0; // Every 8th task has a voice message

    let voiceFile = null;
    let description = `This is a detailed description for task number ${i}. This task involves various activities and requires attention to detail.`;

    if (hasVoice) {
      const audioType = audioTypes[i % audioTypes.length];
      const audioIndex = Math.floor(i / 8) % audioDescriptions.length;
      voiceFile = `voice-${i}${audioType}`;
      description = audioDescriptions[audioIndex] + ` - ${description}`;
    }

    tasks.push({
      title: hasVoice ? `🎤 Task ${i} (Audio)` : `Task ${i}`,
      description: description,
      completed: Math.random() > 0.7, // 30% chance of being completed
      userId: user.id,
      image: hasImage ? `image-${i}.jpg` : null, // Every 10th task has an image
      file: hasFile ? `document-${i}.pdf` : null, // Every 15th task has a file
      voice: voiceFile // Every 8th task has a voice message
    });
  }

  // Insert tasks in batches to avoid overwhelming the database
  const batchSize = 50;
  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);
    await prisma.task.createMany({
      data: batch
    });
    console.log(`✅ Created tasks ${i + 1} to ${Math.min(i + batchSize, tasks.length)}`);
  }

  // Display statistics
  const tasksWithImages = tasks.filter(t => t.image).length;
  const tasksWithFiles = tasks.filter(t => t.file).length;
  const tasksWithVoice = tasks.filter(t => t.voice).length;

  console.log('🎉 Seeding completed successfully!');
  console.log(`📊 Created ${tasks.length} tasks for user ${user.email}`);
  console.log(`🖼️  Tasks with images: ${tasksWithImages} (${Math.round(tasksWithImages/tasks.length*100)}%)`);
  console.log(`📄 Tasks with files: ${tasksWithFiles} (${Math.round(tasksWithFiles/tasks.length*100)}%)`);
  console.log(`🎤 Tasks with voice messages: ${tasksWithVoice} (${Math.round(tasksWithVoice/tasks.length*100)}%)`);
  console.log(`📝 Tasks with only text: ${tasks.length - tasksWithImages - tasksWithFiles - tasksWithVoice} (${Math.round((tasks.length - tasksWithImages - tasksWithFiles - tasksWithVoice)/tasks.length*100)}%)`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
