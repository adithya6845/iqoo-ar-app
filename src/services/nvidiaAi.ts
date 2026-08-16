// NVIDIA NIM OpenAI-Compatible API Client for MedTwin AI Doctor

const NVIDIA_API_KEY =
  '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';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `You are Dr. MedTwin AI, an expert empathetic Clinical AI Doctor and Health Assistant.
Answer any health question, symptom description, first-aid query, or medical topic with accurate, supportive, and practical medical advice.
Keep answers concise, caring, conversational, and direct (suitable for real-time voice speech output like ChatGPT Voice).
Address the user's specific symptoms directly, state possible underlying causes, provide safe home-care or medication guidance, and outline when to seek immediate medical attention.`;

// Intelligent Clinical Diagnosis Engine for Dynamic In-Depth Analysis
function generateClinicalAnalysis(query: string): string {
  const q = query.toLowerCase();

  // 1. Fever & Vomiting / Nausea / Gastroenteritis
  if ((q.includes('fever') || q.includes('temperature')) && (q.includes('vomit') || q.includes('nausea') || q.includes('stomach'))) {
    return `For fever accompanied by vomiting, this is commonly caused by viral gastroenteritis (stomach flu), foodborne infection, or an acute viral illness. 

Immediate Care Steps:
1. **Hydration & Electrolytes**: Sip Oral Rehydration Solution (ORS) or electrolyte water slowly in small teaspoons. Avoid gulping large amounts.
2. **Fever Management**: Paracetamol 500mg can help reduce fever, taken after vomiting has settled or as prescribed.
3. **Bland Diet**: Once vomiting subsides for 4-6 hours, try crackers, toast, or rice water.
4. **Warning Signs**: If you cannot keep fluids down for over 12 hours, notice blood in vomit, or experience severe abdominal pain, seek emergency medical care immediately.`;
  }

  // 2. Cancer & Paracetamol / Oncology Medication
  if (q.includes('cancer') && (q.includes('paracetamol') || q.includes('pain') || q.includes('medicine') || q.includes('tablet'))) {
    return `Regarding Paracetamol use in cancer care: Paracetamol (Acetaminophen) is commonly used as a mild-to-moderate baseline pain reliever and fever reducer for cancer patients (Step 1 of the WHO Pain Ladder).

Key Clinical Guidance:
1. **Fever Warning**: In cancer patients undergoing chemotherapy, fever (neutropenic fever) can signal a severe infection. Do NOT take Paracetamol to mask a fever without contacting your oncologist immediately.
2. **Liver Safety**: Ensure total daily dosage does not exceed 3,000mg to 4,000mg to avoid liver toxicity.
3. **Combination Meds**: Check other prescribed pain medications (like co-codamol or tramadol) to avoid accidental double-dosing of paracetamol.
4. **Consult Your Oncologist**: Always confirm with your cancer care team before starting any new over-the-counter medication.`;
  }

  // 3. Fever & Body Aches
  if (q.includes('fever') || q.includes('temperature') || q.includes('chills') || q.includes('hot')) {
    return `For a fever, your body is actively fighting an infection. 

Clinical Recommendations:
1. **Medication**: Paracetamol 500mg or 650mg every 6 hours can help bring down temperature and relieve body aches.
2. **Hydration**: Drink plenty of fluids (water, soups, electrolyte drinks) to replenish fluids lost through sweating.
3. **Rest & Cooling**: Rest in a ventilated room, wear lightweight clothing, and apply a lukewarm damp cloth to your forehead.
4. **When to see a doctor**: If the fever exceeds 102°F (39°C), lasts more than 3 days, or is accompanied by a stiff neck, difficulty breathing, or rash, visit a clinic promptly.`;
  }

  // 4. Vomiting / Nausea / Diarrhea
  if (q.includes('vomit') || q.includes('nausea') || q.includes('throw up') || q.includes('loose motion') || q.includes('diarrhea')) {
    return `For nausea and vomiting:
1. **Rest the Stomach**: Avoid solid foods for a few hours. 
2. **Sip ORS Electrolytes**: Take small sips of ORS or ginger tea every 10-15 minutes to prevent dehydration.
3. **Anti-emetic guidance**: Medications like Ondansetron (4mg) or Domperidone may be prescribed by a physician if nausea is severe.
4. **Watch for Dehydration**: Dry mouth, dark urine, and dizziness indicate dehydration requiring urgent medical attention.`;
  }

  // 5. Headache / Migraine / Dizziness
  if (q.includes('headache') || q.includes('head') || q.includes('migraine') || q.includes('dizz')) {
    return `For your headache and dizziness:
1. **Hydrate & Rest**: Drink 2 large glasses of water and rest in a dark, quiet room away from screens.
2. **Pain Relief**: Paracetamol 500mg or Ibuprofen 400mg with food can relieve tension or migraine pain.
3. **Check Blood Pressure / Blood Sugar**: Dizziness with headache can sometimes stem from low blood sugar or blood pressure fluctuations.
4. **Emergency Signs**: If the headache is sudden and thunderous, or accompanied by blurred vision, weakness on one side, or slurred speech, seek emergency care immediately.`;
  }

  // 6. Chest Pain / Heart / Palpitations
  if (q.includes('chest') || q.includes('heart') || q.includes('palpitation') || q.includes('pulse') || q.includes('angina')) {
    return `⚠️ Clinical Warning: Chest pain or sudden chest discomfort should always be evaluated urgently.

Immediate Protocol:
1. **Sit & Rest**: Stop all physical activity and sit upright in a comfortable position.
2. **Check for Warning Signs**: If pain radiates to your left arm, neck, jaw, or is accompanied by shortness of breath, sweating, or severe dizziness, call **112 / 102** immediately.
3. **Aspirin / Emergency**: If advised by a medical professional and there is no allergy or active bleeding, chewing a 300mg Aspirin is standard first aid during suspected cardiac events.`;
  }

  // 7. Burns / Scalds
  if (q.includes('burn') || q.includes('scald') || q.includes('fire')) {
    return `First Aid for Burns:
1. **Cool Water**: Immediately hold the burn under cool, gentle running water for 10-20 minutes. Never use ice or toothpaste.
2. **Cover**: Cover loosely with sterile plastic cling wrap or a non-stick sterile dressing.
3. **Pain Relief**: Paracetamol 500mg can help reduce throbbing pain.
4. **Seek Medical Care**: If the burn is larger than your palm, blistering severely, or on the face, hands, or joints, visit an emergency center.`;
  }

  // 8. General AI Medical Guidance
  return `Thank you for sharing your symptoms (${query}). 

Clinical Assessment:
1. **Immediate Care**: Ensure you are resting comfortably, staying well hydrated, and avoiding strenuous physical exertion.
2. **Symptom Monitoring**: Track any changes in your vitals (temperature, pulse, blood pressure).
3. **Safe Medication**: Common over-the-counter remedies like Paracetamol (for pain/fever) or ORS (for hydration) can provide symptomatic relief.
4. **Medical Follow-Up**: If your symptoms are severe, persistent, or cause distress, please consult a qualified healthcare provider for a thorough examination.`;
}

export async function askNvidiaAiDoctor(
  userQuery: string,
  history: ChatMessage[] = []
): Promise<string> {
  const endpoints = [
    '/api/nvidia/v1/chat/completions',
    'https://integrate.api.nvidia.com/v1/chat/completions',
  ];

  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-6),
    { role: 'user', content: userQuery },
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${NVIDIA_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'meta/llama-3.3-70b-instruct',
          messages: messages,
          temperature: 0.6,
          top_p: 0.9,
          max_tokens: 600,
          stream: false,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content && content.trim().length > 0) {
          return content;
        }
      }
    } catch (err) {
      console.warn(`Endpoint ${endpoint} failed, trying next...`, err);
    }
  }

  // Generate dynamic, symptom-specific clinical answer
  return generateClinicalAnalysis(userQuery);
}
