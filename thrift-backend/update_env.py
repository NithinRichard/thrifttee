#!/usr/bin/env python3
"""
Script to update .env file with Razorpay credentials
"""

import os

def update_env_file():
    env_file = '.env'
    razorpay_key_id = 'rzp_test_1LkgCKbXRICfuu'
    razorpay_key_secret = '1mXjBWGvebzUPNi3HcmmXX8I'

    # Read existing .env file
    if os.path.exists(env_file):
        with open(env_file, 'r') as f:
            lines = f.readlines()
    else:
        lines = []

    # Update or add Razorpay configuration
    updated_lines = []
    razorpay_section_found = False

    for line in lines:
        if line.startswith('# Razorpay Payment Gateway Configuration'):
            razorpay_section_found = True
            updated_lines.append(line)
            # Add updated credentials
            updated_lines.append(f'RAZORPAY_KEY_ID={razorpay_key_id}\n')
            updated_lines.append(f'RAZORPAY_KEY_SECRET={razorpay_key_secret}\n')
            # Skip the old credential lines
            continue
        elif razorpay_section_found and (line.startswith('RAZORPAY_KEY_ID=') or line.startswith('RAZORPAY_KEY_SECRET=')):
            continue  # Skip old credential lines
        elif line.startswith('# Stripe') or line.startswith('# Redis'):
            razorpay_section_found = False

        updated_lines.append(line)

    # Write back to file
    with open(env_file, 'w') as f:
        f.writelines(updated_lines)

    print("✅ Successfully updated .env file with your Razorpay credentials!")
    print(f"   RAZORPAY_KEY_ID: {razorpay_key_id}")
    print(f"   RAZORPAY_KEY_SECRET: {'*' * len(razorpay_key_secret)}")
    print("\n🚀 Your Django backend is now configured with real Razorpay credentials!")
    print("   You can now test the payment flow end-to-end.")

if __name__ == "__main__":
    update_env_file()
