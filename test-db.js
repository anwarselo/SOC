const postgres = require('postgres');

async function testConnections() {
  const connections = [
    {
      name: "Session Pooler (postgres://)",
      url: `postgres://postgres.aeflpzsocekyyslcrqef:Sedarautomation1%2A@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`
    },
    {
      name: "Transaction Pooler",
      url: `postgres://postgres.aeflpzsocekyyslcrqef:Sedarautomation1%2A@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`
    },
    {
      name: "Direct Connection",  
      url: `postgres://postgres.aeflpzsocekyyslcrqef:Sedarautomation1%2A@aws-0-eu-central-1.compute.amazonaws.com:5432/postgres`
    }
  ];

  for (const { name, url } of connections) {
    console.log(`\n🔍 Testing ${name}...`);
    try {
      const client = postgres(url, { 
        prepare: false,
        ssl: 'require',
        max: 1,
        idle_timeout: 20,
        connect_timeout: 10,
      });
      
      const result = await client`SELECT 1 as test`;
      console.log(`✅ ${name} - Connection successful:`, result);
      
      const userCheck = await client`SELECT COUNT(*) as count FROM "user"`;
      console.log(`✅ ${name} - User table accessible:`, userCheck);
      
      await client.end();
      
      console.log(`✅ ${name} - WORKING! Using this connection.`);
      break;
      
    } catch (error) {
      console.error(`❌ ${name} - Failed:`, error.message);
    }
  }
}

testConnections();