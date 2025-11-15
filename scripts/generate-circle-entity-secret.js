// Circle Entity Secret Generation
// Based on Circle's official sample code: https://github.com/sivakalathi01/w3s-entity-secret-sample-code

const crypto = require('crypto');
const fs = require('fs');

// Step 1: Generate hex encoded entity secret (32 random bytes)
function generateHexEncodedEntitySecret() {
    // Generate a random 32-byte value
    const randomBytes = crypto.randomBytes(32);
    return randomBytes.toString('hex');
}

// Step 2: Get Circle's entity public key
async function getCircleEntityPublicKey() {
    const apiKey = process.env.CIRCLE_API_KEY;
    
    if (!apiKey) {
        throw new Error('CIRCLE_API_KEY environment variable is required');
    }

    try {
        const response = await fetch('https://api.circle.com/v1/w3s/config/entity/publicKey', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to get public key: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.data.publicKey;
    } catch (error) {
        console.error('❌ Failed to get Circle entity public key:', error);
        throw error;
    }
}

// Step 3: Encrypt entity secret with public key
function encryptEntitySecret(hexEncodedEntitySecret, publicKeyPem) {
    // Convert hex to bytes
    const entitySecret = Buffer.from(hexEncodedEntitySecret, 'hex');
    
    if (entitySecret.length !== 32) {
        throw new Error('Invalid entity secret: must be 32 bytes (64 hex characters)');
    }

    // Encrypt using RSA-OAEP with SHA-256
    const encryptedData = crypto.publicEncrypt({
        key: publicKeyPem,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
    }, entitySecret);

    // Encode to base64
    return encryptedData.toString('base64');
}

// Main function to generate and prepare entity secret
async function generateCircleEntitySecret() {
    try {
        console.log('🔐 Generating Circle Entity Secret...\n');

        // Step 1: Generate hex encoded entity secret
        console.log('📋 Step 1: Generating hex encoded entity secret...');
        const hexEncodedEntitySecret = generateHexEncodedEntitySecret();
        console.log('✅ Hex encoded entity secret generated');
        console.log(`📝 Entity Secret: ${hexEncodedEntitySecret}\n`);

        // Step 2: Get Circle's public key
        console.log('🔑 Step 2: Fetching Circle entity public key...');
        const publicKey = await getCircleEntityPublicKey();
        console.log('✅ Public key retrieved from Circle API\n');

        // Step 3: Encrypt entity secret with public key
        console.log('🔒 Step 3: Encrypting entity secret...');
        const entitySecretCiphertext = encryptEntitySecret(hexEncodedEntitySecret, publicKey);
        console.log('✅ Entity secret encrypted successfully\n');

        // Display results
        console.log('🎉 CIRCLE ENTITY SECRET GENERATED!\n');
        console.log('📋 Results:');
        console.log('=' .repeat(60));
        console.log(`Hex Encoded Entity Secret: ${hexEncodedEntitySecret}`);
        console.log(`Entity Secret Ciphertext: ${entitySecretCiphertext}`);
        console.log('=' .repeat(60));

        console.log('\n📝 Next Steps:');
        console.log('1. 🔐 Store the Hex Encoded Entity Secret securely (you\'ll need it)');
        console.log('2. 📋 Register the Entity Secret Ciphertext in Circle Console:');
        console.log('   https://console.circle.com/wallets/dev/configurator');
        console.log('3. 🔧 Update your .env file with:');
        console.log(`   CIRCLE_ENTITY_SECRET=${hexEncodedEntitySecret}`);

        // Save to file for convenience
        const output = {
            hexEncodedEntitySecret,
            entitySecretCiphertext,
            instructions: {
                step1: 'Store the hexEncodedEntitySecret securely',
                step2: 'Register entitySecretCiphertext in Circle Console',
                step3: 'Update CIRCLE_ENTITY_SECRET in .env file',
                consoleUrl: 'https://console.circle.com/wallets/dev/configurator'
            }
        };

        fs.writeFileSync('circle-entity-secret.json', JSON.stringify(output, null, 2));
        console.log('\n💾 Results saved to: circle-entity-secret.json');

        return output;
    } catch (error) {
        console.error('❌ Failed to generate Circle entity secret:', error);
        throw error;
    }
}

// Export for use in other modules
module.exports = {
    generateCircleEntitySecret,
    generateHexEncodedEntitySecret,
    getCircleEntityPublicKey,
    encryptEntitySecret
};

// Run if called directly
if (require.main === module) {
    generateCircleEntitySecret().catch(console.error);
}