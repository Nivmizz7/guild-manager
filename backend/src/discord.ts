import axios from 'axios';
import 'dotenv/config';

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  isAdmin: boolean;
}

const DISCORD_API = 'https://discord.com/api/v10';

export class DiscordAuth {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private guildId: string;
  private adminRoleId: string;

  constructor() {
    this.clientId = process.env.DISCORD_CLIENT_ID || '';
    this.clientSecret = process.env.DISCORD_CLIENT_SECRET || '';
    this.redirectUri = process.env.DISCORD_REDIRECT_URI || '';
    this.guildId = process.env.DISCORD_GUILD_ID || '';
    this.adminRoleId = process.env.DISCORD_ADMIN_ROLE_ID || '';
  }

  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'identify guilds.members.read',
    });
    return `https://discord.com/api/oauth2/authorize?${params}`;
  }

  async exchangeCode(code: string): Promise<string> {
    const data = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri,
    });

    const response = await axios.post(`${DISCORD_API}/oauth2/token`, data, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    return response.data.access_token;
  }

  async getUser(accessToken: string): Promise<DiscordUser> {
    const userResponse = await axios.get(`${DISCORD_API}/users/@me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const user = userResponse.data;
    
    // Check if user has admin role
    let isAdmin = false;
    try {
      const memberResponse = await axios.get(
        `${DISCORD_API}/users/@me/guilds/${this.guildId}/member`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const roles = memberResponse.data.roles || [];
      isAdmin = roles.includes(this.adminRoleId);
    } catch (error) {
      // User not in guild or bot not in server
      console.log('User not in guild or cannot verify roles');
    }

    return {
      id: user.id,
      username: user.username,
      discriminator: user.discriminator,
      avatar: user.avatar,
      isAdmin,
    };
  }
}
