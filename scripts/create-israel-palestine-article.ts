/**
 * scripts/create-israel-palestine-article.ts
 * Creates the Tony Green "ISRAEL AND PALESTINE" op-ed in Sanity.
 * Run: node_modules/.bin/ts-node --esm scripts/create-israel-palestine-article.ts
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@sanity/client';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2025-06-04',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN!,
});

function makeKey(): string {
  return Math.random().toString(36).slice(2, 10);
}

function block(text: string, style = 'normal') {
  return {
    _type: 'block',
    _key: makeKey(),
    style,
    markDefs: [],
    children: [{ _type: 'span', _key: makeKey(), text: text.trim(), marks: [] }],
  };
}

const body = [
  block('Part 1, Summer 2007', 'h2'),
  block(
    'The following article was written in the summer of 2007 for the first ever issue of HOT WILD & FREE (which later had a very slight name change and became HOT WILD FREE). It was published with the frank acknowledgement of the enormity of the subject and no claims were made for my expertise in Middle East affairs. Not even remotely. It was a personal reflection and a response from someone who has long recognised the centrality to world affairs of the Israel/Palestine conflict, and remains deeply vexed by it.'
  ),
  block(
    'As with any issue of conflict, strong passions are aroused on all sides; objectivity is almost inevitably impossible. That seems truer now in the summer of 2014 than ever before. The Fence in the title is of course the Wall that the Israelis have built, they claim, to keep out Palestinian terrorists and suicide bombers. As to whether I was really sitting on it, or had come down firmly on one side, is up to you to decide.'
  ),
  block(
    '[The only changes I have made to this article are to improve punctuation, grammar and the clarity of a handful of sentences. In all other respects what you read here is exactly what I published seven years ago.]'
  ),
  block('SITTING ON THE FENCE', 'h2'),
  block(
    'I was minding my own business. Wandering around the leafy streets of Hampstead where for a brief period I was living out my dream - flatsitting in the area of London I loved most, and where once I was lucky enough to live. I had just been for a coffee, thinking about articles for this first issue of HOT WILD & FREE. I spotted the notice on a tree. Something about flying kites for freedom on Parliament Hill later that afternoon. It was June 5th, the fortieth anniversary of the beginning of the Six Day War. The kites had been made by Palestinian children; the kite-flyers would include representatives of a group called Jews for Justice for Palestinians. These were Jews (and non-Jews) united in their objection to the Israeli Occupation, people who wanted to show that being Jewish does not equate with a slavish, unquestioning support for the State of Israel.'
  ),
  block(
    'The problem is one that has vexed me increasingly, and I had time on my hands. It seemed to fit nicely with the theme of this launch issue: FREEDOM. I decided it would be irresponsible of me to miss this - taking place as it was almost literally on my doorstep and concerning as it did an issue about which I care a great deal but feel so inadequately informed.'
  ),
  block(
    'On my way to Parliament Hill I passed a couple walking in the same direction. I knew they were headed for the kite-flying event. I knew because I worked for a short while on the periphery of the peace movement. And they were the type.'
  ),
  block(
    "Actually in the peace movement there were two types: young hippies who smoked dope and had their own allotments, and older earnest, grey, usually bearded types. As I looked at this couple walking towards parliament Hill I was reminded of an anxiety I had harboured when I was employed as Education Co-ordinator at the Brighton Peace and Environment Centre. Peace doesn't seem to appeal to the young (apart from the allotment lot). It just isn't sexy enough."
  ),
  block(
    'My prejudices were sadly confirmed as, apart from a few children who I assume were not there of their own volition, the teens and twenties I did encounter as I reached the brow of the Hill seemed in the main to be passing by. But I hung around, and noticed there were cameras and journalists with badges and pencils and pads. I had the pencil and pad, but was not dressed to suggest I was here in a professional capacity. But pencils and notepads in situations like this do tend to say: journalist. Not having shaved for two days I tentatively approached a couple of people and before long was myself approached by one of the organisers who had welcomed us all to this kite-flying for peace.'
  ),
  block(
    'It had been explained that the kites had been made by Palestinian children. These kids had been encouraged only to use positive images on their kites and it was moving to see the results. Kids who lived under such terrible circumstances, with so little, had still managed to conjure from their imagination their dreams and hopes and not their nightmarish fears.'
  ),
  block(
    'Anyway, the man who approached me was Luca Salice, a Trustee and the Press Officer for one of the other groups taking part: Camden Abu-Dis. Abu-Dis is a Palestinian village and the organisation exists to foster links between the people of the village and the people of Camden (the London borough of which Hampstead is a rather nice part). Mr Salice was keen to explain that the emphasis of Camden Abu-Dis is human rights and friendship rather than political engagement, so they have no official view about Israel. But they are clear in their opposition to the Israeli Occupation of the Palestinian Territories. This is the issue on which they campaign and they want nothing less than the Occupation to end - completely.'
  ),
  block(
    "Was this likely? Luca Salice was emphatic. 'There is hope. We represent and offer support and hope and this helps the Palestinian people feel less alone and isolated.' Maybe so, but this doesn't guarantee freedom. 'The Occupation will end, though of course things have worsened since the Wall was built.' In spite of this Salice is clear. 'The international community condemns what is decidedly a racist-motivated occupation.' And this, eventually, will mean an end to the oppression of the Palestinian people in the Occupied Territories."
  ),
  block(
    "I hope so. And I admire the courage and determination of people who see an injustice and strive to see things put right. But I don't need to be applying for the position of Middle East Peace Envoy to know that the outlook is bleak."
  ),
  block(
    "One of the people supporting this event was comedian and writer Alexei Sayle. I may not have been displaying my journalistic credentials but I was determined at least to get a quote from him. I suspect he wasn't quite so taken in by my pencil and pad. While, as far as I could see, I actually beat the other journalists to the first 'interview', he didn't offer me quite the time he gave later to a young guy donning a suit and some sort of name badge. But anyway I persevered. I wanted to know why he was supporting the event. As I say he obviously wasn't taken in by my Rhino Essentials Shorthand Notebook. So he didn't offer much: 'Makes a change to hear something positive about Palestine.'"
  ),
  block(
    "Okay I hadn't exactly got the soundbite of the year. But all the same, he was right. We don't hear about Palestine in a positive light - I would venture to say, ever. And what we had heard and seen today was Palestinian children being encouraged to hope and to dream. And the designs on their kites were, as well as being talented, surprisingly childlike. Surprising, because you imagine that children raised in a brutalised society lose completely the innocence and openness of childhood. But these kites suggested otherwise and were a powerful, if small, symbol of hope."
  ),
  block(
    'It certainly beats the images of Palestinian children, which I had seen in the media, dressed as suicide bombers, killers in training, whose only hope is that of Paradise - and that through martyrdom and murder.'
  ),
  block(
    "I'm suspecting some will have read into that last statement that I am after all just an unthinking supporter of the State of Israel who thinks that the Palestinians are their own worst enemies. That it isn't Israeli injustice that has brutalised the Palestinian people but their own perverse Muslim religion and its sanctioning of violence in God's name. Well no actually. I do know better. Not least that not all Palestinians are Muslims, and that Islam is something so much bigger, richer and more life-affirming than is suggested by militant Islamists and their ilk. But neither do I feel compelled to deny what I see, or feel the need to ignore a whole dimension to what's going on in this strip of land smaller than the size of Wales. Just because it's a bit like Wales doesn't mean I have to be a sheep..."
  ),
  block(
    "I support the rights of Palestinians and the more I have read, and watched TV, and talked about the issues with people far more knowledgeable than I, the more my eyes have been opened. Israel has much to answer for and I don't accept the claim of some that criticism of Israel is inevitably rooted in anti-Semitism, or a cloak for it. But I am certainly no enemy of Israel either and believe in its moral and legal right to exist. Those taking part in the kite-flying weren't taking a position on this and as Luca Salice said it's the occupation of the Territories, the post-67 boundaries of Israel, which are their concern. But I cannot allow this to blind me to the way in which some (not, I am sure, my friends on Parliament Hill) who appear concerned about the abuse of human rights are happy to jump into bed with those who have no respect for human rights whatever."
  ),
  block('On Anti-Semitism and the Peace Movement', 'h2'),
  block(
    "I'm bothered by the number of educated and intelligent people I have encountered who demonstrate something other than a legitimate concern about Israel, whose attitudes spill over into plain old anti-Semitism. I was in Edinburgh last year (August 2006) for the Festival at the time of the Israel-Lebanon war. On my last day there the friend with whom I was staying wanted to go on the Stop the War March. I supported the call for the war to end, but I declined to join the march because I felt that the issues had become clouded and at times seriously distorted. I claim no expertise in Middle East affairs and my perceptions of this war may have been wrong. But I predicted that, as with so many 'peace' marches, there would be a high level of hate-filled aggression on the part of a few who came with an altogether different agenda, not truly motivated by a desire for peace and justice. I just didn't want to stand shoulder-to-shoulder with such types. This didn't make me indifferent - and certainly not a warmonger."
  ),
  block(
    "Sadly my predictions were spot on. I watched the march from the roadside. At the risk of this being knee-jerk exaggeration the likes of which I normally despise in the right-wind media, I would have to sum up the atmosphere of much of what I saw as Long Live Hezbollah (which my friend openly acknowledged afterwards was to his dismay being chanted by some) and, while I didn't actually hear it said in so many words, there was an unmistakable ethos of Death to Israel. Let's face it, if you're chanting Long Live Hezbollah you may as well be shouting Death to Israel (and I don't think it would be stretching it too far to suggest that, in the case of Hezbollah, this gets pretty near to meaning Death to all Jews)."
  ),
  block(
    "As a liberal Christian and a gay man, brought up in a very Jewish area of Greater London, I have learned to hate prejudice and bigotry. (I've suffered my fair share for being gay.) So I fail to understand why there are gay people who are supportive of the attitudes, actions and laws prevalent in societies such as Palestine where women, and gay people, have very few - I think I mean no - rights."
  ),
  block(
    "And no, this isn't a smoke-screen, a distraction from what is happening to the Palestinian people. Unless of course you don't consider Palestinian women, and lesbians and gay men to be people. And neither America nor Britain nor Israel is responsible for beliefs that lead to abuse and murder of these minority groups within Palestinian society. Beliefs which also influence greatly attitudes towards the Jews. Beliefs founded in many instances upon pure lies. As is the case with the Hamas Constitution referring approvingly to The Protocols of the Elders of Zion, the most pernicious hoax in the history of anti-Jewish feeling adding as it does to the justification of the murder of millions of Jews in the 20th century. It seems to me that Hitler and the Nazis were defeated but that their spirit is very much alive and well."
  ),
  block(
    'Yet there are many in the West as well as in the Middle East for whom the only Nazis in the world right now are the Jews.'
  ),
  block('Peace, Justice, and Truth', 'h2'),
  block(
    "I heard Bruce Kent (with whom I had previously worked), over the years a tireless worker for peace, speak at a fringe meeting during the Festival (the same day as the Stop the War March). He said, rightly, that there can be no peace (in any situation) without justice. It seems as obvious that there can be no justice without truth. I'm sure Mr Kent would agree."
  ),
  block(
    "And I was heartened therefore to hear Kent's response to someone at the meeting who expressed understanding and sympathy for the young men who are so desperate they are 'forced' to become suicide bombers. The great peace campaigner responded that he did not feel sympathy for suicide bombers. They are not driven by desperation, he said, but rather their desire for Paradise, and the numerous women they are promised. Mr Kent said he reserved his sympathy for those who truly are desperate and lonely and fearful in their suffering, who feel they have no one to turn to, and for whom taking their own lives really does seem to be the only way out. I fully concur."
  ),
  block(
    "During my hour or so on Parliament Hill I witnessed a slightly manic rendition of the Mary Poppins song, adapted for the occasion: 'Let's go fly a kite, for peace and freedom...' performed by someone who named herself Mary Poppout in honour of the great lady herself (a drag queen couldn't have wished for a better name). I had to smile (and cringe) at how twee it all was, and at its further reminder that peace just isn't sexy."
  ),
  block(
    'But as I said, the journalists were there and I sort of admired Mary Poppout for, well, getting out there and doing her bit to let people know that there are those in the Jewish community who have not forgotten their Palestinian brothers and sisters. I am glad that people are helping Palestinian children to look to a positive future, not just one that perpetuates the hell they are in. I am glad there are people inside and outside of Israel; Jews, Muslims and Christians, secularists and others, who want peace and freedom for the victims of oppression in Palestine.'
  ),
  block(
    "But of this I am clear: I don't believe it is right to censure debate about Israel with claims that such debate is motivated by, or cloaks, anti-Semitism. But neither do I think it right to censure debate about the reality of anti-Semitism in the modern world by suggesting that those so concerned are somehow part of a worldwide Zionist conspiracy."
  ),
  block(
    'As I came down from Parliament Hill I had to wonder. Were we flying kites for freedom or were we just up there with our heads in the clouds?'
  ),
];

async function main() {
  console.log('Creating Israel/Palestine op-ed article...\n');

  // ── Image: Parliament Hill, London (Wikimedia Commons CC BY-SA 3.0, 2007) ──
  console.log('Downloading Parliament Hill image...');
  const imageUrl =
    'https://upload.wikimedia.org/wikipedia/commons/7/70/Parliament_Hill%2C_London.JPG';
  let mainImageRef: string | null = null;
  try {
    const res = await fetch(imageUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const asset = await client.assets.upload('image', buffer, {
      filename: 'parliament-hill-london-2007.jpg',
      contentType: 'image/jpeg',
    });
    mainImageRef = asset._id;
    console.log(`✓ Image uploaded: ${asset._id}`);
  } catch (err) {
    console.error('✗ Image upload failed:', err);
  }

  // ── Op-Ed category ──
  console.log('Finding or creating Op-Ed category...');
  let categoryId: string | null = null;
  const existingCat = await client.fetch<{ _id: string } | null>(
    `*[_type == "category" && (slug.current == "op-ed" || title match "Op*Ed" || title match "op-ed")][0]{ _id }`
  );
  if (existingCat) {
    categoryId = existingCat._id;
    console.log(`✓ Found existing category: ${categoryId}`);
  } else {
    const created = await client.create({
      _type: 'category',
      title: 'Op-Ed',
      slug: { _type: 'slug', current: 'op-ed' },
      description: 'Opinion and editorial pieces from contributors and staff.',
    });
    categoryId = created._id;
    console.log(`✓ Created Op-Ed category: ${categoryId}`);
  }

  // ── Tony Green author ──
  console.log('Finding Tony Green author...');
  const author = await client.fetch<{ _id: string } | null>(
    `*[_type == "author" && name == "Tony Green"][0]{ _id }`
  );
  const authorId = author?._id ?? null;
  console.log(authorId ? `✓ Author found: ${authorId}` : '✗ Author not found');

  // ── Check for duplicate ──
  const slug = 'israel-and-palestine-a-personal-reflection';
  const existing = await client.fetch<{ _id: string } | null>(
    `*[_type == "article" && slug.current == $slug][0]{ _id }`,
    { slug }
  );
  if (existing) {
    console.log(`⊘ Article already exists: ${existing._id}`);
    return;
  }

  // ── Build article document ──
  const doc: Record<string, unknown> = {
    _type: 'article',
    title: 'ISRAEL AND PALESTINE – a Personal Reflection',
    slug: { _type: 'slug', current: slug },
    description:
      "A personal reflection on the Israel/Palestine conflict, originally written in summer 2007 for HOT WILD & FREE magazine. Through a kite-flying event on Parliament Hill organised by Jews for Justice for Palestinians on the 40th anniversary of the Six Day War, the author navigates the deeply complex moral terrain of one of the world's most contentious conflicts.",
    leadParagraph:
      'A personal reflection on the Israel/Palestine conflict, originally written in summer 2007 and republished in 2014. The author attends a kite-flying event on Parliament Hill organised by Jews for Justice for Palestinians, and grapples with the moral complexities of a conflict that defies simple allegiance.',
    keywords: [
      'Israel',
      'Palestine',
      'occupation',
      'peace',
      'Parliament Hill',
      'kite flying',
      'Jews for Justice for Palestinians',
      'Camden Abu-Dis',
      'Six Day War',
      'Middle East',
      'anti-Semitism',
      'op-ed',
      'personal reflection',
      'Alexei Sayle',
      'Luca Salice',
    ],
    publishedAt: '2014-08-03T12:00:00Z',
    location: 'London, England',
    tags: [
      'israel-palestine',
      'middle-east',
      'occupation',
      'peace',
      'op-ed',
      'personal-reflection',
      'anti-semitism',
    ],
    body,
    methodology:
      'Originally written in summer 2007 for the first issue of HOT WILD & FREE magazine. Republished August 3, 2014. The author attended a kite-flying event on Parliament Hill, London, on June 5th, 2007 – the 40th anniversary of the Six Day War – organised by Jews for Justice for Palestinians and Camden Abu-Dis.',
    allowComments: true,
    featured: false,
    breakingNews: false,
    needsReview: false,
    faqs: [
      {
        _type: 'faqItem',
        _key: makeKey(),
        question: 'What was the kite-flying event on Parliament Hill about?',
        answer:
          'On June 5th, 2007 – the 40th anniversary of the Six Day War – an event was held on Parliament Hill where kites made by Palestinian children were flown by representatives of Jews for Justice for Palestinians and Camden Abu-Dis, a group fostering links between the Palestinian village of Abu-Dis and the London borough of Camden.',
      },
      {
        _type: 'faqItem',
        _key: makeKey(),
        question: 'Who is Camden Abu-Dis and what do they stand for?',
        answer:
          'Camden Abu-Dis is an organisation that fosters links between the people of the Palestinian village Abu-Dis and the people of Camden, London. Their emphasis is on human rights and friendship rather than political engagement, and they campaign against the Israeli Occupation of the Palestinian Territories.',
      },
      {
        _type: 'faqItem',
        _key: makeKey(),
        question: "What is the author's position on the Israel/Palestine conflict?",
        answer:
          "The author supports Palestinian rights and believes Israel has much to answer for, but also believes in Israel's moral and legal right to exist. He rejects both the claim that criticism of Israel is inherently anti-Semitic and the suggestion that concern about modern anti-Semitism is somehow a Zionist conspiracy.",
      },
      {
        _type: 'faqItem',
        _key: makeKey(),
        question: 'What does the author mean by "sitting on the fence"?',
        answer:
          'The "fence" refers both literally to the Wall Israel built in the Occupied Territories and metaphorically to the author\'s nuanced position on the conflict — acknowledging Israeli injustice while also refusing to overlook anti-Semitism within some pro-Palestinian movements, or to deny the humanity of Palestinian women and LGBT people.',
      },
    ],
  };

  if (mainImageRef) {
    doc.mainImage = {
      _type: 'image',
      asset: { _type: 'reference', _ref: mainImageRef },
      alt: 'View from Parliament Hill towards Central London, Hampstead Heath, 2007',
    };
  }
  if (authorId) doc.author = { _type: 'reference', _ref: authorId };
  if (categoryId) doc.categories = [{ _type: 'reference', _ref: categoryId }];

  const created = await client.create(doc);
  console.log(`\n✓ Article created: ${created._id}`);
  console.log(`  Slug: ${slug}`);
  console.log(`  Blocks: ${body.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
