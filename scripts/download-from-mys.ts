import fs from "node:fs";
import path from "node:path";
import axios from "axios";

interface MysResponse<T> {
  retcode: string;
  message: string;
  data: T;
}

interface ContentListRes {
  list: Channel[];
}

interface Channel {
  id: number;
  name: string;
  list: any[];
}

interface ActionCard {
  content_id: number;
  title: string;
  icon: string;
}

async function fetchMysDataListByChannelId<T>(channelId: number): Promise<T[]> {
  try {
    const res = await axios<MysResponse<ContentListRes>>(`https://act-api-takumi-static.mihoyo.com/common/blackboard/ys_obc/v1/home/content/list?app_sn=ys_obc&channel_id=${channelId}`);
    return res.data.data.list.find(channel => channel.id === channelId)?.list as T[];
  }
  catch (error) {
    console.error(error);
    return [];
  }
}

async function downloadFile(url: string, targetDir: string, fileName?: string) {
  const originalFileName = path.basename(url);
  const fileExt = path.extname(originalFileName);
  const newFileName = `${fileName ?? originalFileName}${fileExt}`;

  const res = await axios.get(url, { responseType: "stream" });
  await fs.promises.mkdir(targetDir, { recursive: true });
  await fs.promises.writeFile(path.join(targetDir, newFileName), res.data);
}

const characterCardList = await fetchMysDataListByChannelId<ActionCard>(233);
characterCardList.forEach((card) => {
  downloadFile(card.icon, "./gcg/card-faces", card.title.toString());
});

const actionCardList = await fetchMysDataListByChannelId<ActionCard>(234);
actionCardList.forEach((card) => {
  downloadFile(card.icon, "./gcg/card-faces", card.title.toString());
});
