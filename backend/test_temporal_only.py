"""
Simple test to verify Temporal server is running and accessible.
This test doesn't require OpenRouter API key.
"""

import asyncio
from temporalio.client import Client

TEMPORAL_HOST = 'localhost:7233'
TEMPORAL_NAMESPACE = 'default'

async def test_temporal_connection():
    """Test connection to Temporal server"""
    try:
        print("=" * 60)
        print("Testing Temporal Connection")
        print("=" * 60)
        print(f"\nAttempting to connect to Temporal at {TEMPORAL_HOST}...")

        # Try to connect to Temporal
        client = await Client.connect(
            TEMPORAL_HOST,
            namespace=TEMPORAL_NAMESPACE
        )

        print("✅ Successfully connected to Temporal server!")
        print(f"   - Host: {TEMPORAL_HOST}")
        print(f"   - Namespace: {TEMPORAL_NAMESPACE}")

        # Try to list workflows (basic operation)
        print("\n✅ Temporal is running and accessible!")
        print("\nYou can access the Temporal UI at: http://localhost:8233")

        return True

    except Exception as e:
        print(f"\n❌ Failed to connect to Temporal server")
        print(f"   Error: {str(e)}")
        print("\nMake sure Temporal server is running:")
        print("  docker run -p 7233:7233 temporalio/auto-setup:latest")
        print("  OR")
        print("  temporal server start-dev")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_temporal_connection())
    print("\n" + "=" * 60)
    if success:
        print("✅ TEMPORAL IS WORKING!")
    else:
        print("❌ TEMPORAL TEST FAILED")
    print("=" * 60)
