const twilio = require('twilio');

// Configure Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);

async function debugTwilioTemplate() {
  console.log('🔍 Debugging Twilio Template API Call...\n');

  try {
    // Test template SID
    const templateSid = 'HX696c8a9a591bc20193903596d91d4e36';
    const testNumber = '+1234567890'; // Replace with a test number
    
    // Test variables (simulate promotion data)
    const templateParams = {
      '1': 'Test Promotion',
      '2': 'This is a test promotion with discount information',
      '3': 'https://testingbucketchints.s3.ap-south-1.amazonaws.com/uploads/goaiz/1757740948272-agz5ue-wmap.jpg',
      '4': 'Cloud Solutions'
    };

    console.log('📋 Template Configuration:');
    console.log('Template SID:', templateSid);
    console.log('Variables:', templateParams);
    console.log('');

    // Test 1: Standard template without media field
    console.log('1️⃣ Testing standard template format...');
    const messageData1 = {
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${testNumber}`,
      contentSid: templateSid,
      contentVariables: templateParams
    };

    console.log('Message Data:', JSON.stringify(messageData1, null, 2));
    
    try {
      const message1 = await twilioClient.messages.create(messageData1);
      console.log('✅ Standard format successful:', message1.sid);
    } catch (error) {
      console.log('❌ Standard format failed:', error.message);
      console.log('Error code:', error.code);
      console.log('Error details:', error.moreInfo);
    }

    console.log('');

    // Test 2: Check if template exists and get its details
    console.log('2️⃣ Checking template details...');
    try {
      const template = await twilioClient.content.v1.contents(templateSid).fetch();
      console.log('✅ Template found:');
      console.log('Name:', template.friendlyName);
      console.log('Status:', template.status);
      console.log('Language:', template.language);
      console.log('Category:', template.category);
      console.log('Approved:', template.approved);
      
      if (template.types) {
        console.log('Types:', JSON.stringify(template.types, null, 2));
      }
      
    } catch (error) {
      console.log('❌ Template not found or error:', error.message);
    }

    console.log('');

    // Test 3: List all templates to see what's available
    console.log('3️⃣ Listing available templates...');
    try {
      const templates = await twilioClient.content.v1.contents.list({ limit: 10 });
      console.log(`✅ Found ${templates.length} templates:`);
      
      templates.forEach((template, index) => {
        console.log(`${index + 1}. ${template.friendlyName} (${template.sid})`);
        console.log(`   Status: ${template.status}, Approved: ${template.approved}`);
        if (template.types) {
          console.log(`   Types: ${JSON.stringify(template.types)}`);
        }
      });
      
    } catch (error) {
      console.log('❌ Error listing templates:', error.message);
    }

    console.log('');

    // Test 4: Check environment variables
    console.log('4️⃣ Checking environment variables...');
    console.log('TWILIO_ACCOUNT_SID:', accountSid ? '✅ Set' : '❌ Missing');
    console.log('TWILIO_AUTH_TOKEN:', authToken ? '✅ Set' : '❌ Missing');
    console.log('TWILIO_WHATSAPP_NUMBER:', process.env.TWILIO_WHATSAPP_NUMBER ? '✅ Set' : '❌ Missing');
    console.log('Test Number:', testNumber);

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

// Run the debug
if (require.main === module) {
  debugTwilioTemplate().catch(console.error);
}

module.exports = { debugTwilioTemplate };
