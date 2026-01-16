import { NextResponse } from 'next/server';

// Mock activity data
export async function GET() {
  try {
    const activities = [
      {
        id: 1,
        action: 'User login from 192.168.1.100',
        time: '2 minutes ago',
      },
      {
        id: 2,
        action: 'Database created: fpanel_main',
        time: '15 minutes ago',
      },
      {
        id: 3,
        action: 'SSL certificate renewed for example.com',
        time: '1 hour ago',
      },
      {
        id: 4,
        action: 'Backup completed successfully',
        time: '3 hours ago',
      },
      {
        id: 5,
        action: 'Domain added: myapp.example.com',
        time: '5 hours ago',
      },
      {
        id: 6,
        action: 'System update installed',
        time: '1 day ago',
      },
    ];

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json([], { status: 200 });
  }
}
