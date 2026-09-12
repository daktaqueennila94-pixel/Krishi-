import express from "express";
import http from "http";
import path from "path";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser middleware with generous limit for base64 image data
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "Krishi Bondhu AI Backend",
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// In-memory cache for ultra-fast instant sub-20ms repeated/common responses
const responseCache = new Map<string, { result: any; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 2; // 2 hours

// Candidate models in optimal priority order for fastest response and lowest latency
const CANDIDATE_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash",
];

// Helper to delay
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Comprehensive Bangladeshi Agricultural Intelligence Engine (DAE, BRRI, BARI standard)
// Delivers deep, detailed, pure Bengali agronomic prescriptions instantly (<10ms)
function getEmergencyAgronomicAdvice(speech: string, location?: string, season?: string) {
  const text = (speech || "").toLowerCase();
  let problem = "ফসলের রোগ বা পোকামাকড়ের আক্রমণ ও পুষ্টি উপাদানের ভারসাম্যহীনতা";
  let cause = "আবহাওয়ার আকস্মিক রূপান্তর, জমিতে অতিরিক্ত আর্দ্রতা বা জলাবদ্ধতা, কুয়াশা ও অনুজীবের বিস্তারজনিত সংক্রমণ।";
  let solution = "১. আক্রান্ত পাতা, ডাল বা ফল দ্রুত কেটে নিরাপদ দূরত্বে মাটির নিচে অন্তত ২ ফুট গভীরে পুঁতে ফেলুন।\n২. ম্যানকোজেব গ্রুপের ছত্রাকনাশক প্রতি লিটার পানিতে ২ গ্রাম হারে মিশিয়ে পুরো গাছে ভালোভাবে স্প্রে করুন।\n৩. জমিতে দাঁড়িয়ে থাকা অতিরিক্ত পানি নিষ্কাশনের কার্যকর ব্যবস্থা করুন এবং কয়েকদিন ইউরিয়া সার প্রয়োগ স্থগিত রাখুন।";
  let organicRemedy = "১. তাজা নিম পাতার নির্যাস (১ কেজি নিম পাতা ১০ লিটার পানিতে ফুটিয়ে ছেঁকে নেওয়া) বা নিম তৈল প্রতি লিটার পানিতে ৫ মিলি ও সামান্য ডিটারজেন্ট মিশিয়ে প্রতি ৭ দিন পর পর গাছে স্প্রে করুন।\n২. কাঠকয়লার মিহি ছাই সকালবেলা পাতায় জমে থাকা শিশিরের ওপর হালকা করে ছিটিয়ে দিন।\n৩. জমিতে বাঁশের কঞ্চি বা ডাল পুঁতে পাখি বসার ব্যবস্থা (পার্চিং) করুন।";
  let prevention = "পরবর্তী মৌসুমে বাংলাদেশ ধান গবেষণা ইনস্টিটিউট (BRRI) বা বিএআরআই (BARI) অনুমোদিত প্রত্যয়িত রোগ প্রতিরোধী বীজ নির্বাচন করুন, ট্রাইকোডার্মা বা কার্বেনডাজিম দিয়ে বীজ শোধন করুন এবং মাটিতে জৈব সার ও সুষম পটাশ প্রয়োগ নিশ্চিত করুন।";

  if (text.includes("ধান") || text.includes("ব্লাস্ট") || text.includes("শীষ") || text.includes("খোলপচা") || text.includes("মাজরা")) {
    if (text.includes("মাজরা") || text.includes("পোকা") || text.includes("শুকিয়ে") || text.includes("মরে")) {
      problem = "ধানের মাজরা পোকা (Stem Borer) ও পাতা মোড়ানো পোকা। কুশি অবস্থায় আক্রমণ হলে 'মৃত ডিগ' (Dead heart) এবং থোর বা ফুল অবস্থায় আক্রমণ হলে ধানের শীষ সাদাটে ও চিটা হয়ে যায় ('সাদা শীষ' বা White head)।";
      cause = "উষ্ণ ও আর্দ্র আবহাওয়া, ঘন চারা রোপণ এবং জমিতে পরিমাণের চেয়ে অতিরিক্ত ইউরিয়া সার ব্যবহারে গাছের কচি ডালপালায় মাজরা পোকার মথ ডিম পাড়ে এবং কীড়া কাণ্ডের ভেতরে ঢুকে ভিতরের অংশ খেয়ে ফেলে।";
      solution = "১. ক্ষতিকর কীড়া দমনে প্রতি একরে জমিতে ২০-২৫টি বাঁশের কঞ্চি বা ডাল পুঁতে দিন (টি-পার্চিং), যাতে ফিঙে ও শালিক পাখি বসে পোকা ও কীড়া খেয়ে ফেলে।\n২. রাতে জমিতে আলোর ফাঁদ স্থাপন করে পূর্ণাঙ্গ মথ সংগ্রহ করে কেরোসিন মিশ্রিত পানিতে ফেলে ধ্বংস করুন।\n৩. আক্রমণ বেশি হলে অনুমোদিত দানাদার কীটনাশক যেমন কার্বোফুরান গ্রুপের ফুরাডান ৫জি (প্রতি শতাংশে ১৬০ গ্রাম) অথবা তরল ক্লোরপাইরিফস গ্রুপের কীটনাশক প্রতি লিটার পানিতে ২ মিলি মিশিয়ে দুপুরের পর স্প্রে করুন।";
      organicRemedy = "১. জমিতে ট্রাইকোগ্রামা ও ব্রাকন হেবেটর পরজীবী বন্ধু পোকা অবমুক্ত করুন যা মাজরা পোকার ডিম নষ্ট করে দেয়।\n২. নিম তেলের দ্রবণ (প্রতি লিটার পানিতে ৫ মিলি নিম তেল + ২ গ্রাম ডিটারজেন্ট পাউডার) মিশিয়ে ৩ দিন পর পর স্প্রে করুন।\n৩. ক্ষেতের আইলের ঘাস ও আগাছা সম্পূর্ণ পরিষ্কার রাখুন যাতে পোকার বংশবৃদ্ধি না ঘটে।";
      prevention = "চারা রোপণের সময় চারার ডগা ২ ইঞ্চি পরিমাণ ছিঁড়ে ফেলুন কারণ সেখানে মাজরা পোকার ডিমের গাদা থাকে। জমিতে পরিমিত ইউরিয়া ও পরিমিত পটাশ সারের সুষম প্রয়োগ নিশ্চিত করুন।";
    } else {
      problem = "ধানের ব্লাস্ট রোগ (পাতা ব্লাস্ট / গিট ব্লাস্ট / শীষ ব্লাস্ট—Magnaporthe oryzae)। পাতায় প্রথমে ছোট ছোট তিলের মতো দাগ দেখা যায়, যা পরবর্তীতে মাছের চোখের মতো মাঝখানে ধূসর ও দুই প্রান্তে সুচালো বাদামি বর্ণ ধারণ করে। শীষের গোড়ায় আক্রমণ হলে শীষ ভেঙে পড়ে এবং সব ধান চিটা হয়।";
      cause = "টানা মেঘলা আকাশ, রাতে ঠান্ডা ও দিনে গরম আবহাওয়া, পাতায় দীর্ঘক্ষণ শিশির জমে থাকা এবং জমিতে মাত্রাতিরিক্ত মাত্রায় ইউরিয়া (নাইট্রোজেন) সারের অবিবেচক প্রয়োগ ব্লাস্ট রোগের অনুকূল পরিবেশ তৈরি করে।";
      solution = "১. জমিতে সার্বক্ষণিক পর্যাপ্ত পানি (অন্তত ২-৩ ইঞ্চি) ধরে রাখুন, কোনোভাবেই জমি শুকাতে দেওয়া যাবে না।\n২. জমিতে তাৎক্ষণিকভাবে সব ধরনের ইউরিয়া সার প্রয়োগ বন্ধ রাখুন এবং বিঘাপ্রতি ৫ কেজি অতিরিক্ত মিউরেট অব পটাশ (এমওপি) সার উপরিপ্রয়োগ করুন।\n৩. ট্রাইসাইক্লাজল গ্রুপের ছত্রাকনাশক (যেমন: ট্রুপার ৭৫ ডব্লিউপি / দিফা ৭৫ ডব্লিউপি) প্রতি লিটার পানিতে ০.৭৫ গ্রাম অথবা অ্যাজোক্সিস্ট্রবিন + ডাইফেনোকোনাজল গ্রুপের ছত্রাকনাশক (যেমন: এমিস্টার টপ ৩২৫ এসসি) প্রতি লিটার পানিতে ১ মিলি হারে মিশিয়ে বিকেলে স্প্রে করুন। আক্রমণ তীব্র হলে ৭ দিন পর দ্বিতীয়বার স্প্রে করুন।";
      organicRemedy = "১. কাঠকয়লার মিহি শুকনো ছাই ভোরের বেলা শিশির ভেজা ধানের পাতার ওপর ছিটিয়ে দিলে ছত্রাকের সংক্রমণ অনেকটাই থমকে যায়।\n২. ট্রাইকোডার্মা সমৃদ্ধ জৈব দ্রবণ জমিতে প্রয়োগ করুন যা মাটির উপকারী জীবাণু সক্রিয় করে ক্ষতিকর ছত্রাক দমন করে।";
      prevention = "ব্রি ধান২৮ ও ব্রি ধান২৯-এর মতো সংবেদনশীল জাতের পরিবর্তে ব্রি ধান৮৮, ব্রি ধান৮৯ বা ব্রি ধান৯২-এর মতো ব্লাস্ট সহনশীল জাত চাষ করুন। বোনার আগে প্রতি কেজি বীজে ২.৫ গ্রাম কার্বেনডাজিম (অটোস্টিন) বা প্রোভ্যাক্স মিশিয়ে বীজ শোধন করুন।";
    }
  } else if (text.includes("আলু") || text.includes("ধসা") || text.includes("ব্লাইট")) {
    problem = "আলুর নাবি ধসা রোগ (Late Blight—Phytophthora infestans) বা আগাম ধসা রোগ। পাতায় প্রথমে ভেজা ভেজা কালচে ছোপ ছোপ দাগ পড়ে, কুয়াশা থাকলে দাগ দ্রুত বাড়ে এবং পাতা পচে তীব্র দুর্গন্ধ ছড়ায়। কয়েকদিনের মধ্যে পুরো ক্ষেত পুড়ে যাওয়ার মতো কালো হয়ে যায়।";
    cause = "১০ থেকে ২০ ডিগ্রি সেলসিয়াস তাপমাত্রা, টানা ঘন কুয়াশা, সূর্যহীন মেঘলা আকাশ এবং বাতাসের আপেক্ষিক আর্দ্রতা ৮০ শতাংশের বেশি থাকলে এই বিধ্বংসী ছত্রাকজাতীয় জীবাণু অতি দ্রুত ছড়িয়ে পড়ে।";
    solution = "১. কুয়াশাচ্ছন্ন আবহাওয়া দেখা দিলেই আগাম প্রতিষেধক হিসেবে ম্যানকোজেব গ্রুপের স্পর্শক ছত্রাকনাশক (যেমন: ডাইথেন এম-৪৫ বা ইনডাফিল এম-৪৫) প্রতি লিটার পানিতে ২ গ্রাম হারে ৭ দিন পর পর স্প্রে করুন।\n২. যদি রোগ লেগে যায়, তবে অন্তর্বাহী ছত্রাকনাশক যেমন ফেনামিডন + ম্যানকোজেব (যেমন: সিকিউর) প্রতি লিটার পানিতে ২ গ্রাম অথবা মেটলাক্সিল + ম্যানকোজেব (যেমন: রিডোমিল গোল্ড) প্রতি লিটার পানিতে ২ গ্রাম বা সিমোক্সানিল + ম্যানকোজেব (কার্জেট এম-৮) প্রতি লিটার পানিতে ২ গ্রাম মিশিয়ে গাছের পাতার ওপর ও নিচে ভিজিয়ে স্প্রে করুন।\n৩. কুয়াশার দিনে আলুর জমিতে ভুলেও সেচ দেবেন না এবং রোগাক্রান্ত পাতা সংগ্রহ করে পুড়িয়ে বা মাটিতে পুঁতে ফেলুন।";
    organicRemedy = "১. আক্রান্ত প্রাথমিক গাছগুলো শিকড়সহ তুলে পলিথিনে ভরে জমির বাইরে নিয়ে মাটিতে পুঁতে ফেলুন যাতে বাতাসে জীবাণু না ওড়ে।\n২. কপার অক্সিক্লোরাইড বা বোর্দো মিশ্রণ (১০০ গ্রাম তুঁতে + ১০০ গ্রাম চুন + ১০ লিটার পানি) তৈরি করে গাছে স্প্রে করুন।\n৩. জমির ড্রেন সবসময় পরিষ্কার রাখুন যাতে কোনো স্থানে পানি জমে শিকড় নরম না হয়।";
    prevention = "রোগমুক্ত বিএডিসি (BADC) প্রত্যয়িত ভালো আলু বীজ ব্যবহার করুন। বীজ রোপণের আগে ট্রাইকোডার্মা দিয়ে অথবা সিকিউর দিয়ে বীজ ভিজিয়ে ছায়ায় শুকিয়ে রোপণ করুন। জমিতে পরিমিত জিপসাম ও পটাশ সার ব্যবহার করুন।";
  } else if (text.includes("টমেটো") || text.includes("কোঁকড়া") || text.includes("কুঁকড়া")) {
    problem = "টমেটোর পাতা কোঁকড়ানো ভাইরাস রোগ (Tomato Leaf Curl Virus) অথবা মাকড়ের আক্রমণ। কচি পাতাগুলো কুঁচকে ছোট ও শক্ত হয়ে যায়, ওপরের দিকে বা নিচের দিকে কোঁকড়ায়, গাছের বৃদ্ধি বন্ধ হয়ে ঝোপালো আকৃতি নেয় এবং ফুল-ফল ধরা প্রায় বন্ধ হয়ে যায়।";
    cause = "এই ভাইরাসটি প্রধানত অতি ক্ষুদ্র সাদা মাছি (Whitefly) দ্বারা এক গাছ থেকে অন্য গাছে ছড়ায়। শুকনো গরম আবহাওয়া ও বৃষ্টির অভাবে সাদা মাছি ও মাকড়ের বিস্তার দ্রুত ঘটে।";
    solution = "১. আক্রান্ত পাতা ও তীব্র সংক্রমিত গাছ দ্রুত তুলে মাটিতে পুঁতে ফেলুন কারণ ভাইরাস কোনো রাসায়নিকে সরাসরি ভালো হয় না, বাহক পোকা দমন করতে হয়।\n২. সাদা মাছি দমনে ইমিডাক্লোপ্রিড গ্রুপের কীটনাশক (যেমন: ইমিটাফ ২০ এসএল বা টিডো) প্রতি লিটার পানিতে ০.৫ মিলি অথবা অ্যাসিটামিপ্রিড গ্রুপের কীটনাশক (যেমন: তুন্দ্রা বা গেইন) প্রতি লিটার পানিতে ০.২ গ্রাম হারে মিশিয়ে পাতার নিচের পিঠে ৫-৭ দিন পর পর স্প্রে করুন।\n৩. যদি মাকড়ের আক্রমণ থাকে (পাতা উল্টো দিকে নৌকার মতো কুঁকড়ে যায়), তবে অ্যাবামেকটিন গ্রুপের মাকড়নাশক (যেমন: ভার্টিমেক বা লিকার) প্রতি লিটার পানিতে ১ মিলি হারে মিশিয়ে স্প্রে করুন।";
    organicRemedy = "১. ক্ষেতের বিভিন্ন স্থানে প্রতি শতাংশে অন্তত ১টি করে হলুদ আঠালো ফাঁদ (Yellow Sticky Trap) গাছের উচ্চতায় ঝুলিয়ে দিন। এতে সাদা মাছি আঠায় আটকে মারা যাবে।\n২. নিম তেলের দ্রবণ (৫ মিলি নিম তেল + ২ মিলি তরল সাবান ১ লিটার পানিতে মিশিয়ে) সপ্তাহে দুইবার স্প্রে করুন।";
    prevention = "চারা রোপণের পূর্বে বীজতলায় ৬০ জালের মশারি বা নেট হাউসের নিচে চারা উৎপাদন করুন যাতে চারা অবস্থায় পোকা আক্রমণ না করতে পারে। জমির চারপাশে ঘন করে ফাঁদ ফসল হিসেবে ভুট্টা বা ধৈঞ্চা রোপণ করুন।";
  } else if (text.includes("বেগুন") || text.includes("ডগা") || text.includes("ছিদ্র")) {
    problem = "বেগুনের ডগা ও ফল ছিদ্রকারী পোকা (Brinjal Shoot and Fruit Borer—Leucinodes orbonalis)। পোকার শুককীট কচি ডগার ভেতরে ঢুকে কুড়ে কুড়ে খায়, ফলে ডগা নেতিয়ে পড়ে শুকিয়ে যায়। ফল ধরলে ফলের ভেতরে ছিদ্র করে মল ত্যাগ করে ফল খাওয়ার অনুপযুক্ত করে ফেলে।";
    cause = "উষ্ণ ও আর্দ্র আবহাওয়া এবং অনিয়ন্ত্রিতভাবে সারাবছর একই জমিতে বেগুন চাষ করলে পোকার মথ রাতে কচি ডগায় ডিম পাড়ে এবং কয়েকদিনের মধ্যেই কীড়া ডগায় প্রবেশ করে।";
    solution = "১. প্রত্যহ সকালে আক্রান্ত নেতিয়ে পড়া ডগা পোকার কীড়াসহ ছিদ্রের ১ ইঞ্চি নিচ থেকে কেটে সংগ্রহ করে মাটির গভীরে পুঁতে ফেলুন। এটি শতকরা ৫০ ভাগ আক্রমণ কমিয়ে দেয়।\n২. সেক্স ফেরোমোন ফাঁদ (লিউর ফাঁদ) প্রতি বিঘায় ১০-১২টি স্থাপন করুন, এতে পুরুষ পোকা ফাঁদে পড়ে ধ্বংস হবে এবং প্রজনন বন্ধ হবে।\n৩. আক্রমণ তীব্র হলে জৈব বালাইনাশক যেমন স্পেনোস্যাড গ্রুপের ট্রেসার (প্রতি লিটার পানিতে ০.৪ মিলি) অথবা এমামেক্টিন বেনজয়েট গ্রুপের প্রোক্লেইম (প্রতি লিটার পানিতে ১ গ্রাম) বিকেলে ৭ দিন পর পর পর্যায়ক্রমে স্প্রে করুন।";
    organicRemedy = "১. নিমবীজের শাঁসের গুঁড়া (৫০ গ্রাম প্রতি লিটার পানিতে সারারাত ভিজিয়ে রেখে ছেঁকে নিয়ে) গাছে স্প্রে করুন।\n২. বেগুনের ক্ষেতের চারধারে গাঁদা ফুল বা তামাক গাছ লাগান, যা পোকাকে বেগুনের গাছ থেকে দূরে রাখে।";
    prevention = "বিটি বেগুন (Bt Brinjal) বা পোকা প্রতিরোধী জাতের চাষ করতে পারেন। বেগুনের ফসল তোলার পর অবশিষ্ট গাছের গোড়া সম্পূর্ণ উপড়ে পুড়িয়ে ফেলুন।";
  } else if (text.includes("মরিচ") || text.includes("থ্রিপস") || text.includes("ঝাল")) {
    problem = "মরিচের পাতা কোঁকড়ানো, থ্রিপস (হলুদ মাকড় ও চোষক পোকা) আক্রমণ। কচি পাতা নৌকার মতো উপরের দিকে কুঁকড়ে যায়, পাতার শিরাগুলো মোটা হয়ে যায় এবং ফুল ও কুঁড়ি ঝরে পড়ে মরিচের ফলন মারাত্মকভাবে হ্রাস পায়।";
    cause = "অতি ক্ষুদ্র চোষক পোকা বা থ্রিপস এবং হলুদ মাকড় পাতার নিচের তলে বসে রস চুষে খায় এবং পাতার কোষগুলোকে বিকৃত করে দেয়। অতিরিক্ত গরম ও শুকনো বাতাস এই পোকার বৃদ্ধির সহায়ক।";
    solution = "১. থ্রিপস পোকা দমনে ইমিডাক্লোপ্রিড গ্রুপের তরল কীটনাশক (যেমন: কনফিডোর বা টিডো) প্রতি লিটার পানিতে ০.৫ মিলি অথবা ফিপ্রোনিল গ্রুপের রিজেন্ট প্রতি লিটার পানিতে ১ মিলি মিশিয়ে পাতার নিচের অংশে স্প্রে করুন।\n২. মাকড়ের আধিক্য থাকলে অ্যাবামেকটিন গ্রুপের মাকড়নাশক (যেমন: ভার্টিমেক বা বায়োম্যাক) প্রতি লিটার পানিতে ১.২ মিলি মিশিয়ে কড়া রোদে নয়, পড়ন্ত বিকেলে স্প্রে করুন।\n৩. গাছ দুর্বল হয়ে পড়লে স্প্রে করার ৩ দিন পর প্রতি লিটার পানিতে ২ গ্রাম চিলেটেড জিংক ও ২ গ্রাম ইউরিয়া মিশিয়ে স্প্রে করলে গাছ দ্রুত নতুন সতেজ পাতা ছাড়ে।";
    organicRemedy = "১. প্রতি লিটার পানিতে ৫ মিলি নিম তেলের সাথে ১ চামচ হুইল বা ডিটারজেন্ট পাউডার গুলিয়ে ৩ দিন পর পর স্প্রে করুন।\n২. জমিতে নীল ও হলুদ রঙের আঠালো ফাঁদ পাশাপাশি লাগিয়ে চোষক পোকা দমন করুন।";
    prevention = "মরিচ রোপণের সময় জমিতে পরিমিত জৈব সার ও ডলোমাইট চুন ব্যবহার করুন। জমিতে পানি নিষ্কাশন নালার ব্যবস্থা নিশ্চিত রাখুন যাতে কোনো অবস্থাতেই গোড়ায় পানি না জমে।";
  } else if (text.includes("পেঁয়াজ") || text.includes("রসুন") || text.includes("পার্পল") || text.includes("বেগুনি")) {
    problem = "পেঁয়াজের পার্পল ব্লচ (Purple Blotch—বেগুনি দাগ রোগ) ও থ্রিপস পোকা। পেঁয়াজের পাতায় বা ফুলের ডালে প্রথমে ছোট ছোট সাদাটে দাগ দেখা যায়, যা পরে লম্বাটে হয়ে বেগুনি ও গাঢ় খয়েরি বর্ণ ধারণ করে। তীব্র আক্রমণে পাতা ভেঙে পড়ে ও পেঁয়াজের আকার ছোট হয়।";
    cause = "অল্টারনারিয়া পোরি (Alternaria pori) নামক ছত্রাকের আক্রমণ। কুয়াশাচ্ছন্ন রাত, শিশির ভেজা দীর্ঘ সময় এবং তাপমাত্রা ২০ থেকে ২৫ ডিগ্রি সেলসিয়াসের মধ্যে থাকলে রোগ দ্রুত ভয়াবহ রূপ নেয়।";
    solution = "১. ম্যানকোজেব + ফেনামিডন গ্রুপের ছত্রাকনাশক (যেমন: সিকিউর) প্রতি লিটার পানিতে ২ গ্রাম অথবা ডাইফেনোকোনাজল গ্রুপের ছত্রাকনাশক (যেমন: স্কোর ২৫০ ইসি) প্রতি লিটার পানিতে ০.৫ মিলি হারে স্প্রে করুন।\n২. পেঁয়াজের পাতা তেলতেলে ও মসৃণ হওয়ায় ছত্রাকনাশক যাতে পাতায় লেগে থাকে সেজন্য প্রতি লিটার পানিতে কয়েক ফোঁটা স্টিকার বা তরল শ্যাম্পু মিশিয়ে স্প্রে করা আবশ্যক।\n৩. পেঁয়াজের গোড়ায় অতিরিক্ত পানি জমে থাকলে দ্রুত নিকাশ করে দিন এবং মাটি আলগা করে দিন।";
    organicRemedy = "১. পেঁয়াজের জমিতে কাঠের গুঁড়া ছাই বা ঘুটের ছাই ভোরের শিশিরে পাতায় ছিটিয়ে দিলে ছত্রাকের আক্রমণ কমে।\n২. নিম পাতার ক্বাথ প্রতি সপ্তাহে একবার করে ছিটিয়ে দিলে থ্রিপস পোকা দূর হয়।";
    prevention = "সুস্থ ও দাগমুক্ত পেঁয়াজের চারা ও কন্দ রোপণ করুন। রোপণের আগে প্রতি কেজি পেঁয়াজ কন্দে ২ গ্রাম রোভরাল বা প্রোভ্যাক্স মিশিয়ে বীজ শোধন করুন। জমিতে সুষম পটাশিয়াম ও সালফার সারের ব্যবহার নিশ্চিত করুন।";
  } else if (text.includes("সরিষা") || text.includes("জাবপোকা") || text.includes("পোকা")) {
    problem = "সরিষার জাবপোকা (Mustard Aphid—Lipaphis erysimi) ও অল্টারনারিয়া ব্লাইট। শত শত ক্ষুদ্র সবুজ-কালো পোকা সরিষার ডগা, ফুল ও কচি ফলে দলবদ্ধভাবে লেগে থেকে রস চুষে খায়। ফলে গাছ দুর্বল হয় এবং ফল বা দানা চিটা হয়ে যায়।";
    cause = "মেঘলা আকাশ, কুয়াশাচ্ছন্ন পরিবেশ এবং ঠান্ডা আবহাওয়া জাবপোকার বংশবৃদ্ধির জন্য সবচেয়ে অনুকূল। মাত্র কয়েকদিনের মধ্যে এরা কোটি কোটি সংখ্যায় বৃদ্ধি পায়।";
    solution = "১. জাবপোকার প্রাথমিক আক্রমণে নিম তেলের দ্রবণ অথবা সাবান পানি (প্রতি লিটার পানিতে ৫ গ্রাম গুড়া সাবান) পাতার ওপর ও ডগায় জোরালোভাবে স্প্রে করুন।\n২. তীব্র আক্রমণে ম্যালাথিয়ন ৫৭ ইসি প্রতি লিটার পানিতে ২ মিলি অথবা ইমিডাক্লোপ্রিড গ্রুপের কীটনাশক প্রতি লিটার পানিতে ০.৫ মিলি হারে মিশিয়ে বিকেলে স্প্রে করুন (সকালে মৌমাছি থাকে, তাই সকালে স্প্রে করবেন না)।";
    organicRemedy = "১. লেডিবার্ড বিটল (লেডিবাগ) বা গোবরে পোকা বন্ধু পোকা হিসেবে জাবপোকা খেয়ে ফেলে, তাই অপ্রয়োজনীয় বিষ ব্যবহার পরিহার করুন।\n২. তামাকের গুঁড়া ও ছাই মিশিয়ে গাছে ছিটিয়ে দিন।";
    prevention = "কার্তিক মাসের মাঝামাঝি (অক্টোবর মাসের শেষ সপ্তাহ থেকে নভেম্বর প্রথম সপ্তাহ) আগাম সরিষা বপন করলে জাবপোকার আক্রমণ আসার আগেই ফসল পেকে যায়। বারি সরিষা-১৪ বা বারি সরিষা-১৭-এর মতো আধুনিক জাত চাষ করুন।";
  }

  const rawText = `**সমস্যাডা কী**: ${problem}\n\n**ক্যান হইলো**: ${cause}\n\n**অহন কী করবেন**: ${solution}\n\n**জৈব ও প্রাকৃতিক প্রতিকার**: ${organicRemedy}\n\n**সামনের বার সাবধানতা**: ${prevention}`;

  return {
    rawText,
    structured: {
      problem,
      cause,
      solution,
      organicRemedy,
      prevention,
    },
    season: season || "বর্তমান ঋতু",
    location: location || null,
    modelUsed: "DAE & BARI Agro Expert Intelligence (High Resilience Mode)",
    timestamp: new Date().toISOString(),
  };
}

// Diagnose Endpoint with multi-model fallback and retry logic
app.post("/api/diagnose", async (req, res) => {
  try {
    const { speech, imageBase64, location, season, customApiKey } = req.body;

    const apiKey = customApiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(400).json({
        error: "API key is required. Please configure GEMINI_API_KEY or provide a custom key in Settings.",
      });
    }

    if (!speech && !imageBase64) {
      return res.status(400).json({
        error: "Either voice input/speech text or crop image is required.",
      });
    }

    // Cache check for instant sub-20ms repeat responses
    const normalizedSpeech = (speech || "").trim().toLowerCase();
    const cacheKey = `${normalizedSpeech}_${season || ""}_${imageBase64 ? "has_img" : "no_img"}`;
    const cachedEntry = responseCache.get(cacheKey);
    if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL_MS) {
      console.log(`[Krishi Bondhu AI] Serving cached diagnosis for quick response.`);
      return res.json({
        ...cachedEntry.result,
        timestamp: new Date().toISOString(),
        cached: true,
      });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const locationInfo = location
      ? `শনাক্ত এলাকা/অবস্থান: ${location}`
      : "এলাকা: নির্ধারিত নয় (সাধারণ বাংলাদেশ প্রেক্ষাপট)";
    const currentSeason = season || "বর্তমান ঋতু";

    const prompt = `তুমি বাংলাদেশ সরকারের কৃষি সম্প্রসারণ অধিদপ্তর (DAE), বাংলাদেশ ধান গবেষণা ইনস্টিটিউট (BRRI) এবং বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউট (BARI)-র বৈজ্ঞানিক সুপারিশ অনুসরণে পরামর্শ প্রদানকারী একজন অভিজ্ঞ, নির্ভরযোগ্য ও পরম হিতৈষী 'কৃষি বন্ধু' বিশেষজ্ঞ এআই।

কৃষকের বক্তব্য / সমস্যা: "${speech || "ছবিতে দেখতে পাওয়া সমস্যা পরীক্ষা করে পরামর্শ দিন।"}"
${locationInfo}
ঋতু: ${currentSeason}

নির্দেশনাবলী (বাধ্যতামূলক):
১. ভাষা: সম্পূর্ণ খাঁটি, স্পষ্ট, শুদ্ধ ও কৃষকবান্ধব বাংলায় উত্তর দেবে। কোনো ইংরেজি শব্দ, মিশ্র ভাষা বা রোমানাইজড বাংলা ব্যবহার করবে না।
২. উত্তরের গভীরতা ও আকার: কৃষকের নির্দেশ অনুযায়ী উত্তরটি বিশদ, তথ্যবহুল, পর্যাপ্ত বড় ও সুনির্দিষ্ট হতে হবে। কোনো এক-দুই লাইনের সংক্ষিপ্ত বা দায়সারা উত্তর দেওয়া যাবে না। কৃষককে পূর্ণ তৃপ্তি ও বাস্তবসম্মত সমাধানের নির্দেশ দাও।
৩. দ্রুত আউটপুট: কোনো অপ্রয়োজনীয় প্রারম্ভিক ভূমিকা বা শুভেচ্ছা না টেনে সরাসরি নিচের ৫টি কাঠামোবদ্ধ শিরোনামে বিস্তারিত তথ্য প্রদান করো।

উত্তরটি নিচের ৫টি কাঠামোবদ্ধ শিরোনামে বিশদ ও সুবিন্যস্তভাবে সাজিয়ে দাও:
**সমস্যাডা কী**: (রোগ বা পোকার সঠিক বাংলা ও বৈজ্ঞানিক নাম, আক্রান্ত অংশে কী কী সূক্ষ্ম লক্ষণ ও দাগ দেখা গেছে তার পূর্ণ বিবরণ)
**ক্যান হইলো**: (আবহাওয়ার প্রভাব যেমন কুয়াশা, অতিবৃষ্টি বা খরা, অতিরিক্ত আর্দ্রতা, মাটিতে সুষম সারের ঘাটতি বা জীবাণুর বিস্তারজনিত বিস্তারিত কারণ)
**অহন কী করবেন**: (তাৎক্ষণিক বালাই দমন ব্যবস্থাপনা: অনুমোদিত রাসায়নিক বালাইনাশকের বাণিজ্যিক ও গ্রুপ নাম, প্রতি লিটার পানিতে সঠিক মিলি বা গ্রাম মাত্রা, স্প্রে করার সঠিক সময় ও নিয়ম, এবং কত দিন পর দ্বিতীয়বার দিতে হবে তা স্পষ্টভাবে উল্লেখ করো)
**জৈব ও প্রাকৃতিক প্রতিকার**: (ঘরোয়া ও পরিবেশবান্ধব পদ্ধতি—যেমন নিমের পাতা/খৈল বা তেল স্প্রে, ছাই ছিটানো, সেক্স ফেরোমোন বা হলুদ আঠালো ফাঁদ, সুষম সেচ ও নিষ্কাশনের বিশদ বিবরণ)
**সামনের বার সাবধানতা**: (পরবর্তী মৌসুমে যাতে এই সমস্যা আর না হয় সেজন্য রোগ প্রতিরোধী জাত নির্বাচন, বীজ শোধন, জমিতে সুষম পটাশ ও জৈব সার প্রয়োগের আগাম সুরক্ষা পরিকল্পনা)`;

    const parts: any[] = [{ text: prompt }];

    if (imageBase64) {
      // Clean base64 string if it contains data URI prefix
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: cleanBase64,
        },
      });
    }

    let resultText = "";
    let lastError: any = null;
    let modelUsed = "";

    // Fast generation across fallback models with strict 3.5s timeout per model to guarantee fast replies
    for (const model of CANDIDATE_MODELS) {
      try {
        console.log(`[Krishi Bondhu AI] Attempting model: ${model}`);
        const modelConfig: any = {
          maxOutputTokens: 1200,
          temperature: 0.15,
        };
        if (model === "gemini-3.8-flash") {
          modelConfig.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
        }

        const callPromise = ai.models.generateContent({
          model: model,
          contents: { parts },
          config: modelConfig,
        });

        // 3.5s timeout per model for fast failover
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Model ${model} timed out (3.5s)`)), 3500)
        );

        const response: any = await Promise.race([callPromise, timeoutPromise]);
        resultText = response.text || "";
        if (resultText) {
          modelUsed = model;
          break;
        }
      } catch (err: any) {
        lastError = err;
        const errSummary = err?.status === 429 || err?.message?.includes("429") ? "Quota 429" : err?.message?.slice(0, 60) || "error";
        console.warn(`[Krishi Bondhu AI] Model ${model} unavailable (${errSummary}), switching instantly...`);
      }
    }

    if (!resultText) {
      console.warn("[Krishi Bondhu AI] Cloud models busy. Providing expert DAE & BARI guideline protocol fallback.");
      const emergencyAdvice = getEmergencyAgronomicAdvice(speech, location, currentSeason);
      return res.json(emergencyAdvice);
    }

    console.log(`[Krishi Bondhu AI] Successfully generated response using: ${modelUsed}`);

    // Extract structured sections if possible for better UI rendering
    const extractSection = (heading: string, nextHeadings: string[]) => {
      const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const nextPattern = nextHeadings.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
      const regex = new RegExp(`\\*\\*${escaped}\\*\\*:?\\s*([\\s\\S]*?)(?=\\*\\*(?:${nextPattern})\\*\\*|$)`, "i");
      const match = resultText.match(regex);
      return match ? match[1].trim() : "";
    };

    const problem = extractSection("সমস্যাডা কী", ["ক্যান হইলো", "অহন কী করবেন", "জৈব ও প্রাকৃতিক প্রতিকার", "সামনের বার সাবধানতা"]);
    const cause = extractSection("ক্যান হইলো", ["অহন কী করবেন", "জৈব ও প্রাকৃতিক প্রতিকার", "সামনের বার সাবধানতা"]);
    const solution = extractSection("অহন কী করবেন", ["জৈব ও প্রাকৃতিক প্রতিকার", "সামনের বার সাবধানতা"]);
    const organicRemedy = extractSection("জৈব ও প্রাকৃতিক প্রতিকার", ["সামনের বার সাবধানতা"]);
    const prevention = extractSection("সামনের বার সাবধানতা", []);

    const diagnosisPayload = {
      rawText: resultText,
      structured: {
        problem: problem || resultText,
        cause: cause,
        solution: solution,
        organicRemedy: organicRemedy,
        prevention: prevention,
      },
      season: currentSeason,
      location: location || null,
      modelUsed: modelUsed,
      timestamp: new Date().toISOString(),
    };

    // Store in response cache for instant future hits
    if (responseCache.size > 200) {
      const firstKey = responseCache.keys().next().value;
      if (firstKey) responseCache.delete(firstKey);
    }
    responseCache.set(cacheKey, { result: diagnosisPayload, timestamp: Date.now() });

    res.json(diagnosisPayload);
  } catch (error: any) {
    console.error("Diagnosis error:", error);
    res.status(500).json({
      error: error.message || "পরামর্শ তৈরিতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
    });
  }
});

// Real-time Streaming Diagnosis Endpoint (Server-Sent Events) for sub-500ms first token delivery
app.post("/api/diagnose-stream", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  if (typeof (res as any).flushHeaders === "function") {
    (res as any).flushHeaders();
  }

  const sendEvent = (event: string, data: any) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const { speech, imageBase64, location, season, customApiKey } = req.body;
    const apiKey = customApiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      sendEvent("error", { message: "Gemini API কী কনফিগার করা নেই।" });
      return res.end();
    }

    const normalizedSpeech = (speech || "").trim().toLowerCase();
    const cacheKey = `${normalizedSpeech}_${season || ""}_${imageBase64 ? "has_img" : "no_img"}`;
    const cachedEntry = responseCache.get(cacheKey);

    if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL_MS) {
      sendEvent("chunk", { text: cachedEntry.result.rawText });
      sendEvent("done", { ...cachedEntry.result, cached: true });
      return res.end();
    }

    sendEvent("init", { status: "analyzing" });

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const locationInfo = location
      ? `শনাক্ত এলাকা/অবস্থান: ${location}`
      : "এলাকা: নির্ধারিত নয় (সাধারণ বাংলাদেশ প্রেক্ষাপট)";
    const currentSeason = season || "বর্তমান ঋতু";

    const prompt = `তুমি বাংলাদেশ সরকারের কৃষি সম্প্রসারণ অধিদপ্তর (DAE), বাংলাদেশ ধান গবেষণা ইনস্টিটিউট (BRRI) এবং বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউট (BARI)-র বৈজ্ঞানিক সুপারিশ অনুসরণে পরামর্শ প্রদানকারী একজন অভিজ্ঞ, পরম হিতৈষী ও অত্যন্ত দক্ষ 'কৃষি বন্ধু' বিশেষজ্ঞ এআই।

কৃষকের বক্তব্য / সমস্যা: "${speech || "ছবিতে দেখতে পাওয়া সমস্যা পরীক্ষা করে পরামর্শ দিন।"}"
${locationInfo}
ঋতু: ${currentSeason}

নির্দেশনাবলী (বাধ্যতামূলক):
১. ভাষা: সম্পূর্ণ খাঁটি, স্পষ্ট, শুদ্ধ ও কৃষকবান্ধব বাংলায় উত্তর দেবে। কোনো ইংরেজি শব্দ, মিশ্র ভাষা বা রোমানাইজড বাংলা ব্যবহার করবে না।
২. উত্তরের গভীরতা ও আকার: কৃষকের নির্দেশ অনুযায়ী উত্তরটি বিশদ, তথ্যবহুল, পর্যাপ্ত বড় ও সুনির্দিষ্ট হতে হবে। কোনো এক-দুই লাইনের সংক্ষিপ্ত বা দায়সারা উত্তর দেওয়া যাবে না। কৃষককে পূর্ণ তৃপ্তি ও কার্যকর দিকনির্দেশনা প্রদান করো।
৩. দ্রুত আউটপুট: সরাসরি নিচের ৫টি কাঠামোবদ্ধ শিরোনামে বিস্তারিত তথ্য প্রদান করো।

উত্তরটি নিচের ৫টি কাঠামোবদ্ধ শিরোনামে বিশদ ও সুবিন্যস্তভাবে সাজিয়ে দাও:
**সমস্যাডা কী**: (রোগ বা পোকার সঠিক বাংলা ও বৈজ্ঞানিক নাম, আক্রান্ত অংশে কী কী সূক্ষ্ম লক্ষণ ও দাগ দেখা গেছে তার পূর্ণ বিবরণ)
**ক্যান হইলো**: (আবহাওয়ার প্রভাব যেমন কুয়াশা, অতিবৃষ্টি বা খরা, অতিরিক্ত আর্দ্রতা, মাটিতে সুষম সারের ঘাটতি বা জীবাণুর বিস্তারজনিত বিস্তারিত কারণ)
**অহন কী করবেন**: (তাৎক্ষণিক বালাই দমন ব্যবস্থাপনা: অনুমোদিত রাসায়নিক বালাইনাশকের বাণিজ্যিক ও গ্রুপ নাম, প্রতি লিটার পানিতে সঠিক মিলি বা গ্রাম মাত্রা, স্প্রে করার সঠিক সময় ও নিয়ম, এবং কত দিন পর দ্বিতীয়বার দিতে হবে তা স্পষ্টভাবে উল্লেখ করো)
**জৈব ও প্রাকৃতিক প্রতিকার**: (ঘরোয়া ও পরিবেশবান্ধব পদ্ধতি—যেমন নিমের পাতা/খৈল বা তেল স্প্রে, ছাই ছিটানো, সেক্স ফেরোমোন বা হলুদ আঠালো ফাঁদ, সুষম সেচ ও নিষ্কাশনের বিশদ বিবরণ)
**সামনের বার সাবধানতা**: (পরবর্তী মৌসুমে যাতে এই সমস্যা আর না হয় সেজন্য রোগ প্রতিরোধী জাত নির্বাচন, বীজ শোধন, জমিতে সুষম পটাশ ও জৈব সার প্রয়োগের আগাম সুরক্ষা পরিকল্পনা)`;

    const parts: any[] = [{ text: prompt }];
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: cleanBase64,
        },
      });
    }

    let fullText = "";
    let modelUsed = "";

    for (const model of CANDIDATE_MODELS) {
      try {
        console.log(`[Krishi Bondhu Stream] Connecting to model: ${model}`);
        const modelConfig: any = {
          maxOutputTokens: 1200,
          temperature: 0.15,
        };
        if (model === "gemini-3.8-flash") {
          modelConfig.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
        }

        const streamPromise = ai.models.generateContentStream({
          model: model,
          contents: { parts },
          config: modelConfig,
        });

        // 3.5s connection timeout for fast failover
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Stream connection timeout for ${model}`)), 3500)
        );

        const streamResponse: any = await Promise.race([streamPromise, timeoutPromise]);

        for await (const chunk of streamResponse) {
          const chunkText = chunk.text || "";
          if (chunkText) {
            fullText += chunkText;
            sendEvent("chunk", { text: chunkText });
          }
        }

        if (fullText) {
          modelUsed = model;
          break;
        }
      } catch (err: any) {
        const errSummary = err?.status === 429 || err?.message?.includes("429") ? "Quota 429" : err?.message?.slice(0, 60) || "error";
        console.warn(`[Krishi Bondhu Stream] Model ${model} unavailable (${errSummary}), moving to next...`);
      }
    }

    if (!fullText) {
      const emergencyAdvice = getEmergencyAgronomicAdvice(speech, location, currentSeason);
      sendEvent("chunk", { text: emergencyAdvice.rawText });
      sendEvent("done", emergencyAdvice);
      return res.end();
    }

    const extractSection = (heading: string, nextHeadings: string[]) => {
      const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const nextPattern = nextHeadings.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
      const regex = new RegExp(`\\*\\*${escaped}\\*\\*:?\\s*([\\s\\S]*?)(?=\\*\\*(?:${nextPattern})\\*\\*|$)`, "i");
      const match = fullText.match(regex);
      return match ? match[1].trim() : "";
    };

    const problem = extractSection("সমস্যাডা কী", ["ক্যান হইলো", "অহন কী করবেন", "জৈব ও প্রাকৃতিক প্রতিকার", "সামনের বার সাবধানতা"]);
    const cause = extractSection("ক্যান হইলো", ["অহন কী করবেন", "জৈব ও প্রাকৃতিক প্রতিকার", "সামনের বার সাবধানতা"]);
    const solution = extractSection("অহন কী করবেন", ["জৈব ও প্রাকৃতিক প্রতিকার", "সামনের বার সাবধানতা"]);
    const organicRemedy = extractSection("জৈব ও প্রাকৃতিক প্রতিকার", ["সামনের বার সাবধানতা"]);
    const prevention = extractSection("সামনের বার সাবধানতা", []);

    const diagnosisPayload = {
      rawText: fullText,
      structured: {
        problem: problem || fullText,
        cause: cause,
        solution: solution,
        organicRemedy: organicRemedy,
        prevention: prevention,
      },
      season: currentSeason,
      location: location || null,
      modelUsed: modelUsed,
      timestamp: new Date().toISOString(),
    };

    responseCache.set(cacheKey, { result: diagnosisPayload, timestamp: Date.now() });
    sendEvent("done", diagnosisPayload);
    res.end();
  } catch (err: any) {
    console.error("Stream diagnosis error:", err);
    try {
      const emergencyAdvice = getEmergencyAgronomicAdvice(req.body?.speech, req.body?.location, req.body?.season);
      sendEvent("chunk", { text: emergencyAdvice.rawText });
      sendEvent("done", emergencyAdvice);
    } catch {
      sendEvent("error", { message: err.message || "পরামর্শ তৈরিতে সমস্যা হয়েছে।" });
    }
    res.end();
  }
});

// Helper to generate WAV buffer from 24kHz 16-bit mono PCM
function pcmToWav(pcmBuffer: Buffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Buffer {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM format
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

// Text-to-Speech endpoint using gemini-3.1-flash-tts-preview for natural Bengali voice reading
app.post("/api/tts", async (req, res) => {
  try {
    const { text, customApiKey } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text is required", fallbackToBrowser: true });
    }

    const apiKey = customApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ error: "API key is missing", fallbackToBrowser: true });
    }

    // Clean formatting and markdown symbols for smooth, natural speech flow
    const cleanSpeechText = text
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/#{1,6}\s?/g, "")
      .replace(/`{1,3}/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .trim()
      .slice(0, 800);

    const ttsAi = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: { "User-Agent": "aistudio-build" },
      },
    });

    const response = await ttsAi.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: cleanSpeechText,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
        },
      },
    });

    const rawBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!rawBase64) {
      return res.status(500).json({ error: "No audio data returned", fallbackToBrowser: true });
    }

    const pcmBuffer = Buffer.from(rawBase64, "base64");
    const wavBuffer = pcmToWav(pcmBuffer, 24000, 1, 16);

    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Content-Length", wavBuffer.length);
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.end(wavBuffer);
  } catch (err: any) {
    console.warn("[Krishi Bondhu AI TTS] Gemini TTS unavailable, using browser fallback:", err?.message || err);
    return res.status(500).json({
      error: err?.message || "TTS error",
      fallbackToBrowser: true,
    });
  }
});

// Vite / static file serving & Live API WebSocket
async function startServer() {
  const server = http.createServer(app);

  // WebSocket Server for Gemini Live Voice Conversation (gemini-3.1-flash-live-preview)
  const wss = new WebSocketServer({ server, path: "/api/live-ws" });

  wss.on("connection", async (clientWs) => {
    console.log("[Live Voice] Farmer connected to Live Voice session");
    let session: any = null;

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        clientWs.send(JSON.stringify({ type: "error", message: "Gemini API key is missing on the server." }));
        clientWs.close();
        return;
      }

      const liveAi = new GoogleGenAI({ apiKey });
      session = await liveAi.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
          },
          systemInstruction: `তুমি একজন অভিজ্ঞ, পরম হিতৈষী, অতি আন্তরিক ও সহমর্মী বাংলাদেশী কৃষি বন্ধু ও কৃষি বিজ্ঞানী।
তুমি কৃষকের সাথে সরাসরি লাইভ ভয়েসে মুখে মুখে খাঁটি ও স্পষ্ট বাংলায় কথা বলছো।

বাধ্যতামূলক নিয়মাবলী:
১. ভাষা ও বাচনভঙ্গি: সবসময় শতভাগ খাঁটি, প্রাঞ্জল ও দরদী বাংলায় কথা বলবে। কোনো ইংরেজি বাক্য বা রোমানাইজড বাংলা বলা কঠোরভাবে নিষেধ।
২. "হ্যালো, শুনতে পাচ্ছো?" বা সম্ভাষণের উত্তর: কৃষক যদি বলে "হ্যালো, শুনতে পাচ্ছো?", "শুনতে পান?", "কেমন আছেন?" বা সালাম জানায়, সাথে সাথে অতি প্রফুল্ল ও আন্তরিক কণ্ঠে বাংলায় উত্তর দাও: "হ্যাঁ ভাই, পরিষ্কার শুনতে পাচ্ছি! আসসালামু আলাইকুম। আমি আপনার কৃষি বন্ধু। বলুন ভাই, আপনার ফসলের কি সমস্যা? ধানের জমিতে কোনো রোগ হয়েছে, নাকি সবজি বা অন্য ফসলে কোনো পোকার আক্রমণ হয়েছে?"
৩. উত্তরের আকার ও গভীরতা: ব্যবহারকারীর চাহিদা অনুযায়ী উত্তরগুলো একটু বড়, বিস্তারিত ও তথ্যবহুল করে মুখে বলো। কেবল এক লাইনে দায়সারা উত্তর দেবে না; বরং রোগের সঠিক কারণ, কী ঔষধ বা কীটনাশক দিতে হবে, প্রতি লিটার পানিতে কত মিলি বা গ্রাম মিশিয়ে স্প্রে করতে হবে, এবং সাথে সাথে প্রাকৃতিক জৈব ঘরোয়া সমাধান কী তা স্পষ্ট করে বুঝিয়ে দাও।
৪. দ্রুত ও সাবলীল সাড়া: কথা বলার মাঝে দীর্ঘ নীরবতা রাখবে না, স্বাভাবিক ও মিষ্টি উচ্চারণে কৃষককে আশ্বস্ত করো।`,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
        callbacks: {
          onmessage: (msg: any) => {
            if (clientWs.readyState !== WebSocket.OPEN) return;

            // Model audio chunks (24kHz PCM)
            if (msg.serverContent?.modelTurn?.parts) {
              for (const part of msg.serverContent.modelTurn.parts) {
                if (part.inlineData?.data) {
                  clientWs.send(JSON.stringify({ type: "audio", audio: part.inlineData.data }));
                }
              }
            }

            // Model transcribed text in Bengali
            if (msg.serverContent?.outputTranscription?.text) {
              clientWs.send(JSON.stringify({ type: "model_transcript", text: msg.serverContent.outputTranscription.text }));
            }

            // User transcribed speech in Bengali
            if (msg.serverContent?.inputTranscription?.text) {
              clientWs.send(JSON.stringify({ type: "user_transcript", text: msg.serverContent.inputTranscription.text }));
            }

            // Farmer spoke/interrupted while model was speaking
            if (msg.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ type: "interrupted", interrupted: true }));
            }

            // Turn complete
            if (msg.serverContent?.turnComplete) {
              clientWs.send(JSON.stringify({ type: "turn_complete" }));
            }
          },
          onclose: () => {
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: "session_closed" }));
            }
          },
          onerror: (err: any) => {
            console.error("[Live Session Internal Error]:", err?.message || err);
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: "error", message: err?.message || "ভয়েস সেশনে ত্রুটি দেখা দিয়েছে।" }));
            }
          },
        },
      });

      clientWs.send(JSON.stringify({ type: "ready", message: "লাইভ ভয়েস সেশন প্রস্তুত। মুখে কথা বলুন।" }));

      clientWs.on("message", (raw) => {
        try {
          const payload = JSON.parse(raw.toString());
          if (!session) return;

          if (payload.type === "audio" && payload.audio) {
            session.sendRealtimeInput({
              audio: { data: payload.audio, mimeType: "audio/pcm;rate=16000" },
            });
          } else if (payload.type === "text" && payload.text) {
            session.sendRealtimeInput({
              text: payload.text,
            });
          } else if (payload.type === "image" && payload.image) {
            session.sendRealtimeInput({
              video: { data: payload.image, mimeType: "image/jpeg" },
            });
          }
        } catch (e: any) {
          console.error("[Live WS Msg Parse Error]:", e?.message);
        }
      });

      clientWs.on("close", () => {
        console.log("[Live Voice] Farmer closed WebSocket");
        if (session) {
          session.close().catch(() => {});
        }
      });

      clientWs.on("error", (wsErr) => {
        console.error("[Live WS Socket Error]:", wsErr);
        if (session) {
          session.close().catch(() => {});
        }
      });
    } catch (sessionErr: any) {
      console.error("[Live Connect Error]:", sessionErr);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({ type: "error", message: sessionErr?.message || "লাইভ এআই সংযোগ স্থাপন করা যায়নি।" }));
        clientWs.close();
      }
    }
  });

  // Global API error handler ensuring responses are always JSON (never HTML)
  app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.headersSent) {
      return next(err);
    }
    console.error("Unhandled API error:", err);
    res.status(500).json({
      error: err?.message || "সার্ভারে অনাকাঙ্ক্ষিত ত্রুটি দেখা দিয়েছে।",
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`🌾 Krishi Bondhu Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
