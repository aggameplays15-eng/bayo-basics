import express from 'express';
import fetch from 'node-fetch';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Input sanitization helper
const sanitizeChatInput = (input) => {
  if (typeof input !== 'string') return '';
  
  // Remove common prompt injection patterns
  const injectionPatterns = [
    /ignore\s+(all\s+)?(previous\s+)?instructions?/gi,
    /oublie\s+(toutes\s+les\s+)?instructions?/gi,
    /system\s*:/gi,
    /prompt\s*:/gi,
    /instruction\s*:/gi,
    /<\|system\|>/gi,
    /you\s+are\s+now/gi,
    /tu\s+es\s+maintenant/gi,
    /become\s+(an?\s+)?hacker/gi,
    /deviens\s+un\s+hacker/gi,
  ];
  
  let sanitized = input;
  injectionPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[BLOCKED]');
  });
  
  // Limit length to prevent abuse
  return sanitized.substring(0, 500);
};

// Validate products data
const validateProducts = (products) => {
  if (!Array.isArray(products)) return [];
  return products.slice(0, 50); // Limit to 50 products max
};

// Chat endpoint - uses backend API key, optional auth for rate limiting
router.post('/message', optionalAuth, async (req, res) => {
  try {
    let { message, products } = req.body;
    
    // Sanitize inputs
    message = sanitizeChatInput(message);
    products = validateProducts(products);
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      // Fallback response when API key is not configured
      const fallbackResponses = [
        "Je suis désolé, mais je ne peux pas répondre pour le moment. L'assistant IA n'est pas configuré. Veuillez contacter l'administrateur du site.",
        "Désolé, le service d'IA n'est pas disponible actuellement. Essayez de me contacter plus tard ou utilisez notre formulaire de contact.",
        "Je suis momentanément indisponible. Pour toute question sur nos produits, n'hésitez pas à nous contacter directement par téléphone ou email."
      ];
      const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      return res.json({ message: randomResponse });
    }

    // Prepare product context for AI with images
    const productContext = products.map(p => 
      `- ${p.name} (${p.category}): ${p.price.toLocaleString()} GNF. ${p.description}
        Image: ${p.image}
        Stock: ${p.stock} unités
        ${p.sizes ? `Tailles: ${p.sizes.join(', ')}` : ''}
        ${p.colors ? `Couleurs: ${p.colors.join(', ')}` : ''}`
    ).join('\n');

    // Get unique categories
    const categories = [...new Set(products.map(p => p.category))].join(', ');

    // Prepare product images list for easy reference
    const productImages = products.map(p => ({
      name: p.name,
      image: p.image,
      price: p.price
    }));

    // Log suspicious activity for monitoring
    if (message.includes('[BLOCKED]')) {
      console.warn(`[SECURITY] Potential prompt injection blocked from IP: ${req.ip}, User-Agent: ${req.headers['user-agent']}`);
    }
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.FRONTEND_URL || 'http://localhost:8080',
        "X-Title": "Bayo Basics Assistant",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "openrouter/free",
        "messages": [
          { 
            "role": "system", 
            "content": `Tu es Bayo, l'assistant IA expert suprême de 'Bayo Basics', la boutique e-commerce la plus prestigieuse de Conakry, Guinée. Tu es extrêmement intelligent, courtois et tu connais absolument TOUT sur notre site et nos produits.

            À PROPOS DE BAYO BASICS :
            - Boutique de mode et vêtements premium située à Conakry, Guinée
            - Spécialisée dans les vêtements de qualité, accessoires et articles de mode
            - Réputée pour son service client exceptionnel et ses produits authentiques
            - Site e-commerce moderne avec interface intuitive
            - Fonctionnalités : catalogue, panier, favoris, commandes, authentification utilisateur

            INFORMATIONS DE CONTACT :
            - 📍 Adresse : Centre-ville de Conakry, Guinée
            - 📞 Téléphone : +224 XXX XXX XXX (à personnaliser)
            - 📧 Email : contact@bayobasics.com
            - 🌐 Site web : https://bayobasics.com
            - ⏰ Horaires : Tous les jours de 9h à 20h
            - 🚚 Livraison : Gratuite à Conakry

            INVENTAIRE COMPLET (${products.length} produits dans ${categories.length} catégories):
            Catégories disponibles : ${categories}
            
            ${productContext}

            POLITIQUES ET SERVICES :
            • PAIEMENT : UNIQUEMENT à la livraison (Cash on Delivery) - Pas de paiement en ligne
            • LIVRAISON : GRATUITE à Conakry, rapide et fiable
            • RETOURS : Politique de retour flexible sous 7 jours
            • CLIENTÈLE : Service personnalisé et attentionnée
            • HORAIRES : Ouvert tous les jours de 9h à 20h

            CAPACITÉS DE BAYO :
            - Tu peux recommander des produits selon les goûts, budgets et occasions
            - Tu connais les détails de chaque produit (tailles, couleurs, matières, images)
            - IMPORTANT : Quand tu recommandes un produit, TU DOIS inclure son image en utilisant l'URL fournie
            - Format d'image obligatoire : ![Nom du produit](URL_exacte_de_l_image_du_produit)
            - Exemple : ![Chemise en Lin](http://localhost:3001/uploads/chemise-lin.jpg)
            - Utilise TOUJOURS l'URL exacte de l'image fournie dans les données du produit
            - Tu peux conseiller sur les tendances actuelles et les assortiments
            - Tu peux expliquer les politiques de livraison et paiement
            - Tu peux aider avec les questions sur le compte, les commandes et les favoris
            - Tu peux suggérer des looks complets et des ensembles coordonnés
            - Tu peux comparer les produits et donner des avis objectifs
            - Tu peux fournir des informations de contact avec visuels si demandé

            TON ET STYLE :
            - Professionnel, chaleureux et convivial
            - Expert mais accessible, jamais condescendant
            - Utilise un français impeccable avec parfois des expressions locales guinéennes polies
            - Enthousiaste et passionné par la mode
            - Toujours prêt à aider avec des conseils personnalisés
            - Réponds de manière détaillée et informative quand approprié

            RÈGLES STRICTES :
            1. Ne mentionne JAMAIS que tu es une IA - tu es Bayo, le conseiller expert
            2. Réponds TOUJOURS en français
            3. Base tes recommandations sur l'inventaire réel disponible
            4. Si tu ne connais pas la réponse exacte, propose d'aider autrement
            5. Sois précis dans les prix et détails produits
            6. Adapte tes réponses selon le niveau de détail demandé par le client
            7. Utilise des émojis modérément pour rendre la conversation plus chaleureuse 👔✨` 
          },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();
    console.log('OpenRouter response:', JSON.stringify(data, null, 2));
    
    if (data.choices && data.choices[0]) {
      res.json({ message: data.choices[0].message.content });
    } else {
      throw new Error("Erreur API");
    }
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Erreur lors de la communication avec l\'API' });
  }
});

export default router;
