from django.core.management.base import BaseCommand
from myapp.models import Badge

class Command(BaseCommand):
    help = 'Seed initial badges for the gamification system'

    def handle(self, *args, **options):
        badges = [
            {
                'name': 'Early Bird',
                'description': 'Complete your first workout session!',
                'icon_name': 'Zap',
                'requirement_type': 'workout_count',
                'requirement_value': 1
            },
            {
                'name': 'Week Warrior',
                'description': 'Maintain a 7-day activity streak.',
                'icon_name': 'Flame',
                'requirement_type': 'streak',
                'requirement_value': 7
            },
            {
                'name': 'Muscle King',
                'description': 'Complete 50 strength training sessions.',
                'icon_name': 'Dumbbell',
                'requirement_type': 'body_part_count',
                'requirement_value': 50,
                'body_part': 'Strength'
            },
            {
                'name': 'Cardio Master',
                'description': 'Burn a total of 5000 calories from cardio.',
                'icon_name': 'TrendingUp',
                'requirement_type': 'total_calories',
                'requirement_value': 5000
            },
            {
                'name': 'Century Club',
                'description': 'Complete 100 total workouts.',
                'icon_name': 'Trophy',
                'requirement_type': 'workout_count',
                'requirement_value': 100
            }
        ]

        for b_data in badges:
            badge, created = Badge.objects.get_or_create(
                name=b_data['name'],
                defaults=b_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created badge: {badge.name}'))
            else:
                self.stdout.write(self.style.WARNING(f'Badge already exists: {badge.name}'))
