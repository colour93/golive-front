export class User {
  id!: number;
  username!: string;
  nickname!: string;
  email!: string;
  password!: string;
  verified!: number;
  avatar?: Buffer;
  avatarExt?: "png" | "jpeg" | "webp";
  key?: string;
  created!: Date;
}

export class UserInfo {
  id!: number;
  username!: string;
  nickname!: string;
  avatarUrl?: string;
  verified!: number;
}

export class UserProfile extends UserInfo {
  streamServer!: string;
  streamKey!: string;
  liveroom!: string;
}

export class UserLiveInfo {
  user!: UserInfo;
  stream!: {
    flv: string;
    hls: string;
  } | null;
  ws!: {
    chat: string;
  } | null;
}
