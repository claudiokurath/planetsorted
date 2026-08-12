console.log('Env keys:', Object.keys(process.env).filter(k => k.includes('URL') || k.includes('SUPABASE') || k.includes('POSTGRES') || k.includes('DB')));
