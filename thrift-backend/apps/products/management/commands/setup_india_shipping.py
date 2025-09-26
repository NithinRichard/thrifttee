from django.core.management.base import BaseCommand
from apps.products.models import ShippingZone, ShippingMethod, ShippingRate

class Command(BaseCommand):
    help = 'Create default shipping zones and rates for India'

    def handle(self, *args, **options):
        # Create shipping zones
        zones_data = [
            {
                'name': 'Local (Delhi NCR)',
                'description': 'Delhi, Noida, Gurgaon, Ghaziabad, Faridabad',
                'states': 'DL,UP,HR',
                'metro_cities': '110001,110002,110003,201301,122001,201001,121001',
                'base_cost': 40,
                'free_shipping_threshold': 800
            },
            {
                'name': 'Regional (North India)',
                'description': 'North Indian states excluding NCR',
                'states': 'UP,HR,PB,RJ,JK,HP,UT',
                'base_cost': 60,
                'free_shipping_threshold': 1000
            },
            {
                'name': 'South India',
                'description': 'Southern states of India',
                'states': 'TN,KL,KA,AP,TG',
                'base_cost': 80,
                'free_shipping_threshold': 1200
            },
            {
                'name': 'West India',
                'description': 'Western states of India',
                'states': 'MH,GJ,MP,CG',
                'base_cost': 70,
                'free_shipping_threshold': 1100
            },
            {
                'name': 'East India',
                'description': 'Eastern states of India',
                'states': 'WB,BR,JH,OR',
                'base_cost': 75,
                'free_shipping_threshold': 1150
            },
            {
                'name': 'North East India',
                'description': 'North Eastern states',
                'states': 'AS,AR,MN,ML,MZ,NL,TR,SK',
                'base_cost': 100,
                'free_shipping_threshold': 1500
            },
            {
                'name': 'Island Territories',
                'description': 'Andaman, Nicobar, Lakshadweep',
                'states': 'AN,LD',
                'base_cost': 150,
                'free_shipping_threshold': 2000
            }
        ]

        # Create shipping methods
        methods_data = [
            {
                'name': 'Standard Delivery',
                'description': '3-5 business days',
                'estimated_days': 5,
                'cost_multiplier': 1.0,
                'max_weight_kg': 5.0
            },
            {
                'name': 'Express Delivery',
                'description': '2-3 business days',
                'estimated_days': 3,
                'cost_multiplier': 1.5,
                'max_weight_kg': 3.0
            },
            {
                'name': 'Premium Express',
                'description': '1-2 business days',
                'estimated_days': 2,
                'cost_multiplier': 2.0,
                'max_weight_kg': 2.0
            }
        ]

        # Create zones
        zones = []
        for zone_data in zones_data:
            zone, created = ShippingZone.objects.get_or_create(
                name=zone_data['name'],
                defaults=zone_data
            )
            zones.append(zone)
            if created:
                self.stdout.write(f'Created zone: {zone.name}')

        # Create methods
        methods = []
        for method_data in methods_data:
            method, created = ShippingMethod.objects.get_or_create(
                name=method_data['name'],
                defaults=method_data
            )
            methods.append(method)
            if created:
                self.stdout.write(f'Created method: {method.name}')

        # Create shipping rates
        rates_data = [
            # Local (Delhi NCR) - Standard
            {'zone': 0, 'method': 0, 'min_weight': 0, 'max_weight': 1, 'base_cost': 40, 'per_kg': 10, 'insurance': 0.02},
            {'zone': 0, 'method': 0, 'min_weight': 1, 'max_weight': 3, 'base_cost': 50, 'per_kg': 15, 'insurance': 0.02},
            {'zone': 0, 'method': 0, 'min_weight': 3, 'max_weight': None, 'base_cost': 80, 'per_kg': 20, 'insurance': 0.02},

            # Local (Delhi NCR) - Express
            {'zone': 0, 'method': 1, 'min_weight': 0, 'max_weight': 2, 'base_cost': 60, 'per_kg': 20, 'insurance': 0.02},
            {'zone': 0, 'method': 1, 'min_weight': 2, 'max_weight': None, 'base_cost': 100, 'per_kg': 30, 'insurance': 0.02},

            # Regional (North India) - Standard
            {'zone': 1, 'method': 0, 'min_weight': 0, 'max_weight': 2, 'base_cost': 60, 'per_kg': 15, 'insurance': 0.02},
            {'zone': 1, 'method': 0, 'min_weight': 2, 'max_weight': None, 'base_cost': 90, 'per_kg': 25, 'insurance': 0.02},

            # South India - Standard
            {'zone': 2, 'method': 0, 'min_weight': 0, 'max_weight': 2, 'base_cost': 80, 'per_kg': 20, 'insurance': 0.02},
            {'zone': 2, 'method': 0, 'min_weight': 2, 'max_weight': None, 'base_cost': 120, 'per_kg': 30, 'insurance': 0.02},

            # West India - Standard
            {'zone': 3, 'method': 0, 'min_weight': 0, 'max_weight': 2, 'base_cost': 70, 'per_kg': 18, 'insurance': 0.02},
            {'zone': 3, 'method': 0, 'min_weight': 2, 'max_weight': None, 'base_cost': 106, 'per_kg': 28, 'insurance': 0.02},

            # East India - Standard
            {'zone': 4, 'method': 0, 'min_weight': 0, 'max_weight': 2, 'base_cost': 75, 'per_kg': 19, 'insurance': 0.02},
            {'zone': 4, 'method': 0, 'min_weight': 2, 'max_weight': None, 'base_cost': 113, 'per_kg': 29, 'insurance': 0.02},

            # North East - Standard
            {'zone': 5, 'method': 0, 'min_weight': 0, 'max_weight': 2, 'base_cost': 100, 'per_kg': 25, 'insurance': 0.02},
            {'zone': 5, 'method': 0, 'min_weight': 2, 'max_weight': None, 'base_cost': 150, 'per_kg': 35, 'insurance': 0.02},

            # Island Territories - Standard
            {'zone': 6, 'method': 0, 'min_weight': 0, 'max_weight': 2, 'base_cost': 150, 'per_kg': 40, 'insurance': 0.02},
            {'zone': 6, 'method': 0, 'min_weight': 2, 'max_weight': None, 'base_cost': 230, 'per_kg': 50, 'insurance': 0.02},
        ]

        for rate_data in rates_data:
            rate, created = ShippingRate.objects.get_or_create(
                zone=zones[rate_data['zone']],
                method=methods[rate_data['method']],
                min_weight_kg=rate_data['min_weight'],
                defaults={
                    'max_weight_kg': rate_data['max_weight'],
                    'base_cost': rate_data['base_cost'],
                    'per_kg_cost': rate_data['per_kg'],
                    'insurance_rate': rate_data['insurance'],
                    'is_active': True
                }
            )
            if created:
                self.stdout.write(f'Created rate: {rate}')

        self.stdout.write(
            self.style.SUCCESS('Successfully created default shipping configuration for India!')
        )
