# 🚀 Admin Portal with WhatsApp Campaigns

A modern admin portal for managing promotions and sending WhatsApp campaigns using Twilio's WhatsApp Business API.

## ✨ Features

- **🔐 Secure Authentication**: JWT-based login system
- **📊 Promotion Management**: Create, edit, and manage promotional campaigns
- **📱 Mobile Number Management**: Store and organize customer contact lists
- **💬 WhatsApp Campaigns**: Send promotional messages via WhatsApp using Twilio
- **📈 Campaign Analytics**: Track message delivery and engagement
- **🎨 Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **SQLite** database for data persistence
- **Twilio** WhatsApp Business API
- **JWT** for authentication
- **bcryptjs** for password hashing

### Frontend
- **React** with React Query for state management
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API communication
- **React Hot Toast** for notifications

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Twilio account (for WhatsApp functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cloudagent
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=5000
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

   # Twilio Configuration (Required for WhatsApp)
   TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
   TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
   TWILIO_WHATSAPP_NUMBER=+14155238886

   # Optional: Test WhatsApp number for testing
   TEST_WHATSAPP_NUMBER=+1234567890
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📱 WhatsApp Setup

### Option 1: Twilio WhatsApp Business API (Recommended)

1. **Sign up for Twilio**
   - Go to [twilio.com](https://www.twilio.com)
   - Create a free account
   - Get your Account SID and Auth Token

2. **Enable WhatsApp Business API**
   - In Twilio Console, go to **Messaging** → **Try it out** → **Send a WhatsApp message**
   - Follow the setup instructions
   - Get your WhatsApp Business Number

3. **Configure environment variables**
   - Add your Twilio credentials to the `.env` file
   - Restart the server

4. **Test the connection**
   - Go to the WhatsApp Campaigns page
   - Click "Test Connection" to verify setup

### Option 2: Other WhatsApp Providers

You can also use:
- **MessageBird**: [messagebird.com](https://messagebird.com)
- **360dialog**: [360dialog.com](https://360dialog.com)
- **Direct WhatsApp Business API**: Requires Meta approval

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 5000) |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID | Yes (for WhatsApp) |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token | Yes (for WhatsApp) |
| `TWILIO_WHATSAPP_NUMBER` | Twilio WhatsApp number | Yes (for WhatsApp) |
| `TEST_WHATSAPP_NUMBER` | Test phone number | No |

### Database

The application uses SQLite for data storage. The database file is automatically created at `server/database.sqlite`.

## 📊 Usage

### 1. Authentication
- Default admin credentials: `admin` / `admin123`
- Change these credentials after first login

### 2. Managing Promotions
- Create promotional campaigns with titles, descriptions, and discounts
- Set start and end dates for campaigns
- Activate/deactivate promotions as needed

### 3. Managing Mobile Numbers
- Add customer phone numbers with names
- Organize contacts for targeted campaigns
- Import/export contact lists

### 4. Sending WhatsApp Campaigns
- Select a promotion to send
- Choose recipients from your mobile number list
- Customize the message if needed
- Send campaigns and track delivery status

### 5. Monitoring Campaigns
- View delivery logs and status
- Track successful and failed messages
- Monitor campaign performance

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Configured CORS for secure cross-origin requests
- **Helmet**: Security headers for Express.js

## 📈 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Promotions
- `GET /api/promotions` - Get all promotions
- `POST /api/promotions` - Create new promotion
- `PUT /api/promotions/:id` - Update promotion
- `DELETE /api/promotions/:id` - Delete promotion

### Mobile Numbers
- `GET /api/users/mobile-numbers` - Get mobile numbers
- `POST /api/users/mobile-numbers` - Add mobile number
- `PUT /api/users/mobile-numbers/:id` - Update mobile number
- `DELETE /api/users/mobile-numbers/:id` - Delete mobile number

### WhatsApp Campaigns
- `GET /api/whatsapp/status` - Get WhatsApp connection status
- `POST /api/whatsapp/send` - Send WhatsApp campaign
- `GET /api/whatsapp/logs` - Get campaign logs
- `POST /api/whatsapp/test` - Test WhatsApp connection

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Setup
- Set `NODE_ENV=production`
- Configure production database
- Set up proper SSL certificates
- Configure reverse proxy (nginx recommended)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the [Twilio Setup Guide](TWILIO_SETUP.md)
- Review the troubleshooting section in the setup guide
- Open an issue on GitHub

## 🔄 Changelog

### v1.0.0
- Initial release with WhatsApp campaign functionality
- Twilio integration for WhatsApp messaging
- Admin portal with promotion management
- Mobile number management system
- Campaign analytics and logging 