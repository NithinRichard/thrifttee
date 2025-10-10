from django.core.management.base import BaseCommand
from apps.cart.abandoned_cart import process_abandoned_carts

class Command(BaseCommand):
    help = 'Send abandoned cart reminder emails'

    def handle(self, *args, **options):
        self.stdout.write('Processing abandoned carts...')
        sent_count = process_abandoned_carts()
        self.stdout.write(
            self.style.SUCCESS(f'Successfully sent {sent_count} abandoned cart emails')
        )
