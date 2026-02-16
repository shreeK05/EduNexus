const cron = require('node-cron');
const Quiz = require('../models/Quiz');
const Classroom = require('../models/Classroom');
const sendEmail = require('../utils/sendEmail');

// Run every 5 minutes to check for upcoming quizzes
const scheduleQuizReminders = () => {
    cron.schedule('*/5 * * * *', async () => {
        try {
            const now = new Date();
            const thirtyMinutesLater = new Date(now.getTime() + 30 * 60 * 1000);
            const thirtyFiveMinutesLater = new Date(now.getTime() + 35 * 60 * 1000);

            // Find quizzes starting between 30-35 minutes from now
            // (5-minute window to avoid duplicate emails)
            const upcomingQuizzes = await Quiz.find({
                startDate: {
                    $gte: thirtyMinutesLater,
                    $lte: thirtyFiveMinutesLater
                },
                reminderSent: { $ne: true } // Only send if reminder not already sent
            });

            console.log(`🔍 Checking for quiz reminders... Found ${upcomingQuizzes.length} quizzes`);

            for (const quiz of upcomingQuizzes) {
                const classroom = await Classroom.findById(quiz.classId)
                    .populate('students', 'email name')
                    .populate('teacherId', 'name email');

                if (!classroom || classroom.students.length === 0) continue;

                console.log(`⏰ Sending reminders for quiz: ${quiz.title}`);

                const formatTime = (dateString) => {
                    return new Date(dateString).toLocaleString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        dateStyle: 'full',
                        timeStyle: 'short'
                    });
                };

                // Send reminder emails to all students
                classroom.students.forEach(student => {
                    sendEmail({
                        email: student.email,
                        subject: `⏰ REMINDER: Quiz Starting in 30 Minutes - ${quiz.title}`,
                        message: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
                <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 20px; border-radius: 8px 8px 0 0; margin: -20px -20px 20px -20px;">
                  <h2 style="color: white; margin: 0; font-size: 24px;">⏰ Quiz Starting Soon!</h2>
                </div>
                
                <p style="font-size: 16px; color: #333;">Hello <strong>${student.name}</strong>,</p>
                <p style="color: #666; line-height: 1.6;">This is a friendly reminder that your quiz will start in <strong style="color: #f59e0b;">30 minutes</strong>!</p>
                
                <div style="background-color: #faf5ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #9333ea;">
                  <p style="margin: 8px 0;"><strong style="color: #9333ea;">📚 Class:</strong> ${classroom.name} (${classroom.section})</p>
                  <p style="margin: 8px 0;"><strong style="color: #9333ea;">📖 Subject:</strong> ${classroom.subject}</p>
                  <p style="margin: 8px 0;"><strong style="color: #9333ea;">👨‍🏫 Teacher:</strong> ${classroom.teacherId?.name}</p>
                  <p style="margin: 8px 0;"><strong style="color: #9333ea;">🧠 Quiz:</strong> ${quiz.title}</p>
                  <p style="margin: 8px 0;"><strong style="color: #9333ea;">📝 Questions:</strong> ${quiz.questions.length} questions</p>
                </div>
                
                <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                  <p style="margin: 8px 0; color: #92400e;"><strong>🕐 Start Time:</strong> ${formatTime(quiz.startDate)}</p>
                  <p style="margin: 8px 0; color: #92400e;"><strong>⏳ Due Time:</strong> ${formatTime(quiz.dueDate)}</p>
                  <p style="margin: 8px 0; color: #92400e;"><strong>⏱️ Time Remaining:</strong> <span style="font-size: 18px; font-weight: bold;">30 minutes</span></p>
                </div>
                
                <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
                  <p style="margin: 0; color: #991b1b;"><strong>⚠️ Get Ready:</strong> Make sure you have a stable internet connection and are prepared to start the quiz on time!</p>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                  <a href="https://edu-nexus-rho.vercel.app/class/${classroom._id}" style="background-color: #f59e0b; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(245, 158, 11, 0.3);">Go to Quiz Now</a>
                </div>
                
                <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                <p style="color: #9ca3af; font-size: 12px; text-align: center;">This is an automated reminder from EduNexus. Please do not reply to this email.</p>
              </div>
            `
                    })
                        .then(() => console.log(`✅ Reminder sent to ${student.email}`))
                        .catch(err => console.log(`❌ Reminder failed for ${student.email}: ${err.message}`));
                });

                // Mark reminder as sent
                quiz.reminderSent = true;
                await quiz.save();
            }
        } catch (error) {
            console.error('❌ Error in quiz reminder scheduler:', error);
        }
    });

    console.log('✅ Quiz reminder scheduler started (runs every 5 minutes)');
};

module.exports = scheduleQuizReminders;
