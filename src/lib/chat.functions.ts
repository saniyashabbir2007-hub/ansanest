import { createServerFn } from "@tanstack/react-start";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { WEBSITE_KNOWLEDGE } from "./knowledge";
import { listProducts } from "./products-api";

const FALLBACK =
  "I couldn't find enough information on our website to answer that accurately. For personalised assistance, our team can help you on WhatsApp.";

export const askGemini = createServerFn({
  method: "POST",
}).handler(async (ctx: any) => {
  try {
    const data = ctx.data;

    if (!data?.message) {
      return {
        answer: "No message received.",
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("Missing GEMINI_API_KEY");

      return {
        answer:
          "Sorry, the AI assistant is temporarily unavailable.",
      };
    }

    const question = data.message.toLowerCase();

    //
    // OLD SOFA REPAIR QUESTIONS
    //
    if (
      question.includes("repair old sofa") ||
      question.includes("old sofa repair") ||
      question.includes("repair my sofa") ||
      question.includes("reupholstery") ||
      question.includes("replace fabric") ||
      question.includes("foam replacement")
    ) {
      return {
        answer:
          "Yes, ANSA NEST provides old sofa repair, reupholstery, fabric replacement and foam replacement services.",
      };
    }

    //
    // LOAD PRODUCTS
    //
    const products = await listProducts();

    const matchedProduct = products.find((p) =>
      question.includes(p.name.toLowerCase())
    );

    //
    // PRICE QUESTIONS
    //
    if (
      matchedProduct &&
      (question.includes("price") ||
        question.includes("cost") ||
        question.includes("rate"))
    ) {
      return {
        answer: matchedProduct.price
          ? `${matchedProduct.name} is priced at ₹${matchedProduct.price}.`
          : `${matchedProduct.name} is available on price request. Please contact us on WhatsApp for the latest quotation.`,
      };
    }

    //
    // WARRANTY QUESTIONS
    //
    if (
      matchedProduct &&
      question.includes("warranty")
    ) {
      return {
        answer: matchedProduct.warranty
          ? `${matchedProduct.name} comes with ${matchedProduct.warranty} warranty.`
          : "This product's warranty information is currently unavailable. Please contact us on WhatsApp.",
      };
    }

    //
    // BUILD PRODUCT CONTEXT FOR GEMINI
    //
    let productContext = "";

    if (matchedProduct) {
      productContext = `
Matched Product

Name: ${matchedProduct.name}
Price: ${
        matchedProduct.price
          ? `₹${matchedProduct.price}`
          : "Price on Request"
      }
Warranty: ${
        matchedProduct.warranty || "Not specified"
      }
Dimensions: ${
        matchedProduct.dimensions || "Not specified"
      }
Description:
${matchedProduct.description}
`;
    }

    //
    // GEMINI
    //
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
${WEBSITE_KNOWLEDGE}

${productContext}

Customer Question:
${data.message}

Instructions:

- Only answer using information provided above.
- Never invent products or prices.
- If information is unavailable, reply exactly:

${FALLBACK}
`;

    const result =
      await model.generateContent(prompt);

    const answer =
      result.response.text()?.trim() ||
      FALLBACK;

    return {
      answer,
    };
  } catch (error) {
    console.error("GEMINI ERROR:", error);

    return {
      answer:
        "Sorry, something went wrong. Please try again later.",
    };
  }
});