import { NextResponse } from 'next/server';
import { RedisService } from '@/lib/services/redis.service';
import { getCurrentUser } from '@/lib/auth-actions';

export async function GET() {
  try {
    // Check if user is admin (optional, remove if you want public access)
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Test Redis connection
    const healthCheck = await RedisService.getInfo();
    
    // Try a simple operation
    const testKey = 'health:check';
    const testValue = Date.now().toString();
    
    const setResult = await RedisService.set(testKey, testValue, 10);
    const getResult = await RedisService.get(testKey);
    const deleteResult = await RedisService.delete(testKey);
    
    // Check if operations worked
    const operationsOk = setResult && getResult === testValue && deleteResult;

    return NextResponse.json({
      status: healthCheck.connected && operationsOk ? 'healthy' : 'unhealthy',
      redis: {
        connected: healthCheck.connected,
        latency: healthCheck.latency,
        operationsOk,
        error: healthCheck.error
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Redis health check error:', error);
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
