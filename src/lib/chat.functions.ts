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
    const searchQuery = question
  .replace(
    /\b(show me|find|looking for|search|i need|i want|can you show me|display)\b/gi,
    ""
  )
  .trim();
  const synonymMap: Record<string, string> = {
  couch: "sofa",
  couches: "sofa",

  loveseat: "sofa",
  loveseats: "sofa",

  footstool: "ottoman",
  footstools: "ottoman",

  stool: "ottoman",

  seat: "chair",
  seats: "chair",

  lshape: "l-shaped",
  "l shape": "l-shaped",
  "l shaped": "l-shaped",

  corner: "corner sofa",

  fabric: "upholstered",

  wooden: "wood",

  centre: "center",
};
const normalizedQuery = (searchQuery || question)
  .split(/\s+/)
.map((word: string) => synonymMap[word] ?? word)
  .join(" ");

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
    //
// PRICE FILTER DETECTION
//
const priceMatches = [...question.matchAll(/(\d[\d,]*)(k)?/gi)].map((m) => {
  let value = Number(m[1].replace(/,/g, ""));

  if (m[2]) {
    value *= 1000;
  }

  return value;
});

const budget = priceMatches[0] ?? null;
const secondBudget = priceMatches[1] ?? null;
    const matchedProduct = products.find((p) =>
  question.includes(p.name.toLowerCase())
);

const similarProducts = products
  .map((p) => {
const q = normalizedQuery;

    const text = [
      p.name,
      p.category,
      p.sub_type,
      p.short_description,
      p.description,
      p.material,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const words = q
      .split(/\s+/)
.filter((w: string) => w.length > 2)
const score = words.reduce(
  (total: number, word: string) => {
          return total + (text.includes(word) ? 1 : 0);
    }, 0);

    return {
      product: p,
      score,
    };
  })
  .filter((item) => item.score > 0)
  .sort((a, b) => b.score - a.score)
  .map((item) => item.product);
  

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
// BETWEEN PRICE SEARCH
//
if (
  budget &&
  secondBudget &&
  (question.includes("between") ||
    question.includes("to") ||
    question.includes("-"))
) {
  const min = Math.min(budget, secondBudget);
  const max = Math.max(budget, secondBudget);

  const budgetProducts = products.filter((p) => {
    if (!p.price) return false;

    return p.price >= min && p.price <= max;
  });

  if (budgetProducts.length > 0) {
    const list = budgetProducts
      .slice(0, 5)
      .map((p) => `• ${p.name} - ₹${p.price}`)
      .join("\n");

    return {
  answer: `I found ${budgetProducts.length} products.`,
  products: budgetProducts.slice(0, 5),
};
  }
}  
//
// PRICE RANGE SEARCH
//
if (
  budget &&
  (question.includes("under") ||
    question.includes("below") ||
    question.includes("less than") ||
    question.includes("<"))
) {
  const budgetProducts = products.filter((p) => {
  if (!p.price || p.price > budget) return false;

  const text = [
    p.name,
    p.category,
    p.sub_type,
    p.description,
    p.short_description,
    p.material,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const keywords = question
    .replace(/\d[\d,]*/g, "")
    .replace(/under|below|less than|</gi, "")
    .trim();

  if (!keywords) return true;

const words = keywords
  .split(/\s+/)
.filter((w: string) => w.length > 2)

return words.every((word: string) => text.includes(word));
});

  if (budgetProducts.length > 0) {
    const list = budgetProducts
      .slice(0, 5)
      .map((p) => `• ${p.name} - ₹${p.price}`)
      .join("\n");

    return {
      answer: `I found ${budgetProducts.length} product${
        budgetProducts.length > 1 ? "s" : ""
      } under ₹${budget.toLocaleString()}:\n\n${list}\n\nWhich one would you like to know more about?`,
    };
  }
}
const allBudgetProducts = products.filter(
  (p) => p.price && p.price <= budget
);

if (allBudgetProducts.length > 0) {
  const list = allBudgetProducts
    .slice(0, 5)
    .map((p) => `• ${p.name} - ₹${p.price}`)
    .join("\n");

  return {
    answer: `No products matching your keyword were found under ₹${budget.toLocaleString()}.\n\nHere are some products under ₹${budget.toLocaleString()}:\n\n${list}`,
  };
}
//
// ABOVE PRICE SEARCH
//
if (
  budget &&
  (question.includes("above") ||
    question.includes("more than") ||
    question.includes("greater than") ||
    question.includes(">"))
) {
  const budgetProducts = products.filter((p) => {
    if (!p.price || p.price < budget) return false;

    const text = [
      p.name,
      p.category,
      p.sub_type,
      p.description,
      p.short_description,
      p.material,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const keywords = question
      .replace(/\d[\d,]*/g, "")
      .replace(/above|more than|greater than|>/gi, "")
      .trim();

    if (!keywords) return true;

const words = keywords
  .split(/\s+/)
.filter((w: string) => w.length > 2)
return words.every((word: string) => text.includes(word)); 
 });

  if (budgetProducts.length > 0) {
    const list = budgetProducts
      .slice(0, 5)
      .map((p) => `• ${p.name} - ₹${p.price}`)
      .join("\n");

    return {
      answer: `I found ${budgetProducts.length} product${
        budgetProducts.length > 1 ? "s" : ""
      } above ₹${budget.toLocaleString()}:\n\n${list}\n\nWhich one would you like to know more about?`,
    };
  }
}
 //
// SIMILAR PRODUCT SUGGESTIONS
//
if (!matchedProduct && similarProducts.length > 0) {
  const suggestions = similarProducts
    .slice(0, 5)
.map((p, index) => {
        const price = p.price
        ? `₹${p.price}`
        : "Price on Request";

return `${index + 1}. ${p.name} (${price})`;
    })
    .join("\n");

  return {
    answer: `I found ${similarProducts.length} product${
      similarProducts.length > 1 ? "s" : ""
    } related to "${data.message}":\n\n${suggestions}\n\nWhich one would you like to know more about?`,
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