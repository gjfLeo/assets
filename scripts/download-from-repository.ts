import fs from "node:fs";
import path from "node:path";
import axios from "axios";

import { HttpsProxyAgent } from "https-proxy-agent";

const elementNameMap = [
  ["Electric", "electro"],
  ["Fire", "pyro"],
  ["Grass", "dendro"],
  ["Ice", "cryo"],
  ["Rock", "geo"],
  ["Water", "hydro"],
  ["Wind", "anemo"],
];

const fileMap: [string, string][] = [
  ["UI/Icon/Dice/Any/UI_Icon_Dice_Any.png", "element/dice-pattern/any.png"],
  ...elementNameMap.map(([codeName, name]) => [
    `UI/Icon/Dice/${codeName}/UI_Icon_Dice_${codeName}.png`,
    `element/dice-pattern/${name}.png`,
  ] as [string, string]),

  ...elementNameMap.map(([codeName, name]) => [
    `UI/Icon/Element/${codeName}/UI_Icon_Element_${codeName}.png`,
    `element/white-128/${name}.png`,
  ] as [string, string]),

  ...["Common", "Fatui", "Liyue", "Player", "Ranger"].flatMap(faction =>
    elementNameMap.map(([codeName, name]) => [
      `UI/Icon/${faction}/${codeName}/UI_Icon_${faction}_${codeName}.png`,
      `element/${faction.toLocaleLowerCase()}/${name}.png`,
    ] as [string, string]),
  ),

  ...[1, 2, 3, 4, 5].map(type => [
    `UI/Icon/RelicType${type}/UI_Icon_RelicType${type}.png`,
    `relicType/${type}.png`,
  ] as [string, string]),

  // ...["Add", "Arrow", "Setting", "Pause"].map(name => [
  //   `UI/Icon/${name}/UI_Icon_${name}.png`,
  //   `icon/${name.toLocaleLowerCase()}.png`,
  // ] as [string, string]),
];

const repositoryUrlPrefix = "http://raw.githubusercontent.com/umaichanuwu/gi-tex-4.6-full/master/Texture2D/";
const httpsAgent = new HttpsProxyAgent("http://127.0.0.1:33210");

async function downloadFileFromRepository(source: string, target: string) {
  const dir = path.dirname(target);
  await fs.promises.mkdir(dir, { recursive: true });

  const exists = await fs.promises.exists(target);
  const size = exists ? (await fs.promises.stat(target)).size : 0;
  if (size > 0) {
    return;
  }

  const url = `${repositoryUrlPrefix + source}`;
  const response = await axios.get(url, { responseType: "stream", proxy: false, httpsAgent });
  await fs.promises.writeFile(target, response.data);
  console.log(target);
  await new Promise(resolve => setTimeout(resolve, 1000));
}

for (const [source, target] of fileMap) {
  try {
    await downloadFileFromRepository(source, target);
  }
  catch (error) {
    console.error(`${source}: ${error}`);
  }
}
