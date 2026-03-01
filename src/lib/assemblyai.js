import { AssemblyAI } from 'assemblyai';

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY 
});

export const processPodcastAudio = async (filePath) => {
  console.log("Stigao zahtev u AssemblyAI lib za fajl:", filePath);
  
  try {
    const transcript = await client.transcripts.transcribe({
      audio: filePath,
      
      speech_models: ["universal-2"], 
      summarization: true,
      summary_model: 'informative',
      summary_type: 'bullets',
    });

    
    if (transcript.status === 'error') {
      throw new Error(transcript.error);
    }

    return {
      text: transcript.text || "Nema generisanog teksta",
      summary: transcript.summary || "Nema generisanog rezimea"
    };
  } catch (error) {
    console.error("AssemblyAI Error Detalji:", error.message);
    return null;
  }
};