// src/mockData.js
export const mockTracks = [
  {
    id: 'track-1',
    title: 'تراك البرمجة (Programming Track)',
    description:
      'تعلم أساسيات البرمجة، جافا سكريبت، وبناء تطبيقات الويب للأطفال واليافعين.',
    icon: '💻',
    courses: [
      {
        id: 'course-101',
        title: 'كورس أساسيات JavaScript و Kodu',
        sessions: [
          {
            id: 'session-1',
            title: 'السيشن الأول: التعامل مع الـ Console والـ Variables',
            notes:
              'ركزوا يا شباب على الفرق بين let و const وتجربة طباعة البيانات.',
            files: [
              {
                name: 'شيت الشرح الأساسي',
                url: 'https://drive.google.com/file/d/1i66HfXORrwCpuT5EkqzUJowHaNOz4VUh/view?usp=drive_link',
              },
            ],
          },
        ],
      },
      {
        id: 'course-102',
        title: 'كورس بناء المواقع بـ HTML & CSS',
        sessions: [],
      },
    ],
  },
  {
    id: 'track-2',
    title: 'تراك الروبوتكس (Robotics Track)',
    description:
      'توصيل الدوائر الإلكترونية، التعامل مع الأردوينو، وبناء الروبوتات الذكية.',
    icon: '🤖',
    courses: [
      {
        id: 'course-201',
        title: 'كورس الأردوينو والمستشعرات الأساسية',
        sessions: [
          {
            id: 'session-1',
            title: 'السيشن الأول: مقدمة في الأردوينو وتوصيل الـ LED',
            notes: 'تأكدوا من توصيل المقاومة لحماية الـ LED.',
            files: [
              {
                name: 'مخطط التوصيل العملي',
                url: 'https://drive.google.com/drive/u/0/home?lfhs=2',
              },
            ],
          },
        ],
      },
    ],
  },
]
