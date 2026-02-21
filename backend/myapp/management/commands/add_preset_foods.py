from django.core.management.base import BaseCommand
from myapp.models import PresetFood
from myapp.expanded_preset_foods import EXPANDED_PRESET_FOODS


class Command(BaseCommand):
    help = 'Add preset foods and beverages available to all users'

    def handle(self, *args, **options):
        preset_foods = EXPANDED_PRESET_FOODS

        created_count = 0
        for food_data in preset_foods:
            # Check if food already exists
            exists = PresetFood.objects.filter(
                food_name=food_data['food_name']
            ).exists()

            if not exists:
                PresetFood.objects.create(**food_data)
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f"✓ Added: {food_data['food_name']}")
                )
            else:
                self.stdout.write(
                    self.style.WARNING(
                        f"⊘ Already exists: {food_data['food_name']}"
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\n✓ Successfully added {created_count} preset foods and beverages!'
            )
        )
