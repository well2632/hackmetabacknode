const express = require("express");
const axios = require("axios");

const app = express();
const port = 3000;

// Middleware para interpretar JSON no corpo da requisição
app.use(express.json());

// Função para gerar o conteúdo da aula
async function generateLessonContent(userMessage) {
  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-groq-70b-8192-tool-use-preview",
        messages: [
          {
            role: "system",
            content:
              "Você é um assistente professor de crianças com algum problema de transtorno mental, explique de forma didâtica e com conteúdo conciso. Não responda coisas que fogem do objetivo de ensinar  .",
          },
          {
            role: "system",
            content: "O texto irá virar áudio, não use asteriscos ou caracteres especiais",
          },
          {
            role: "system",
            content: "Não use aspas, isso pode quebrar o JSON quando o texto for virar áudio",
          },
          {
            role: "system",
            content: "retorne um texto de no máximo 2 linhas",
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        max_tokens: 300,
      },
      {
        headers: {
          Authorization: `Bearer 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`,
        },
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Erro ao gerar o conteúdo da aula:", error);
    throw error;
  }
}

// Função para gerar o título da aula
async function generateLessonTitle(lessonContent) {
  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-groq-70b-8192-tool-use-preview",
        messages: [
          {
            role: "system",
            content: "Gere um título claro e chamativo para a aula com o seguinte conteúdo.",
          },
          {
            role: "system",
            content: "Não gere caracteres especiais, barras e barras invertidas",
          },
          {
            role: "user",
            content: lessonContent,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer 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`,
        },
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Erro ao gerar o título da aula:", error);
    throw error;
  }
}

async function generateVideo(text) {
  try {
    const response = await axios.post(
      "https://api.heygen.com/v2/video/generate",
      {
        caption: true,
        video_inputs: [
          {
            character: {
              type: "avatar",
              avatar_id: "af108bf75eaa43a386eb66b7dbde7762",
              avatar_style: "normal",
            },
            voice: {
              type: "text",
              input_text: "Teste",
              voice_id: "051a4794b02d4438a99258edfbdf7be6",
              speed: 1.5,
            },
          },
        ],
        test: false,
        dimension: {
          width: 480,
          height: 480,
        },
        aspect_ratio: null,
      },
      {
        headers: {
          Authorization: `Bearer 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`,
          "X-Api-Key": "NzVmYjQ4NTllNjdjNDVhNDkyMTA5NDdlYjU3ZGM1NGEtMTczMTE3OTM1Ng==",
        },
      }
    );
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// https://api.heygen.com/v1/video_status.get?video_id=a3dc3485a73c463c81d6bee303625259

app.post("/generateLesson", async (req, res) => {
  try {
    const userMessage = req.body.userMessage;
    if (!userMessage) {
      return res.status(400).send("userMessage é obrigatório");
    }

    // Gera o conteúdo da aula
    const lessonContent = await generateLessonContent(userMessage);

    // Gera o título da aula com base no conteúdo
    const lessonTitle = await generateLessonTitle(lessonContent);

    const video = await generateVideo(lessonContent);

    // Retorna o conteúdo e o título no JSON
    res.json({ content: lessonContent, title: lessonTitle, video_id: video.data.data.video_id });
  } catch (error) {
    // console.log(error);
    res.status(500).send("Erro ao gerar a aula");
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
