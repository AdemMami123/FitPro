import { generateText } from 'ai'
import { geminiModel } from '@/lib/ai-config'
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/actions/auth.action'
import { getUserProfile } from '@/lib/actions/profile.action'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile for personalization
    const profile = await getUserProfile()
    
    // Get request body
    const { ingredients, preferences, servings } = await request.json()

    // Create personalized prompt
    const prompt = `
You are a professional nutritionist creating a personalized weekly meal plan. You MUST respond with ONLY valid JSON, no additional text or explanations.

User Profile:
- Name: ${user.name}
- Fitness Goal: ${profile?.fitnessGoal || 'general fitness'}
- Age: ${profile?.age || 'not specified'}
- Gender: ${profile?.gender || 'not specified'}
- Weight: ${profile?.weight || 'not specified'}kg
- Height: ${profile?.height || 'not specified'}cm
- Activity Level: ${profile?.activityLevel || 'not specified'}
- Dietary Restrictions: ${profile?.dietaryRestrictions?.join(', ') || 'none'}

Available Ingredients/Foods:
${ingredients.join(', ')}

Preferences:
${preferences || 'None specified'}

Servings: ${servings || 1} person(s)

Create a 7-day meal plan (Monday to Sunday) with:
- Breakfast, Lunch, Dinner, and 2 Snacks for each day
- Use primarily the ingredients provided, supplement with common staples if needed
- Include accurate nutritional information for each meal
- Optimize for the user's fitness goal
- Keep meals varied and interesting

RESPOND ONLY WITH THIS EXACT JSON FORMAT (no additional text):
{
  "weeklyPlan": {
    "Monday": {
      "breakfast": {
        "name": "Scrambled Eggs with Toast",
        "ingredients": ["2 eggs", "1 slice whole grain bread", "1 tbsp butter"],
        "instructions": "Scramble eggs in butter, serve with toasted bread",
        "nutrition": {
          "calories": 380,
          "protein": 18,
          "carbs": 15,
          "fat": 28
        }
      },
      "lunch": {
        "name": "Chicken Rice Bowl",
        "ingredients": ["150g chicken breast", "1 cup cooked rice", "mixed vegetables"],
        "instructions": "Grill chicken, serve over rice with vegetables",
        "nutrition": {
          "calories": 520,
          "protein": 35,
          "carbs": 55,
          "fat": 12
        }
      },
      "dinner": {
        "name": "Beef Stir Fry",
        "ingredients": ["200g beef strips", "mixed vegetables", "soy sauce"],
        "instructions": "Stir fry beef with vegetables, season with soy sauce",
        "nutrition": {
          "calories": 450,
          "protein": 32,
          "carbs": 20,
          "fat": 25
        }
      },
      "snacks": [
        {
          "name": "Apple with Nuts",
          "ingredients": ["1 apple", "30g mixed nuts"],
          "instructions": "Slice apple, serve with nuts",
          "nutrition": {
            "calories": 220,
            "protein": 6,
            "carbs": 25,
            "fat": 12
          }
        },
        {
          "name": "Greek Yogurt",
          "ingredients": ["200g Greek yogurt", "1 tbsp honey"],
          "instructions": "Mix yogurt with honey",
          "nutrition": {
            "calories": 180,
            "protein": 15,
            "carbs": 20,
            "fat": 5
          }
        }
      ]
    },
    "Tuesday": {
      "breakfast": {
        "name": "Oatmeal with Berries",
        "ingredients": ["1 cup oats", "1/2 cup berries", "1 tbsp honey"],
        "instructions": "Cook oats, top with berries and honey",
        "nutrition": {
          "calories": 350,
          "protein": 12,
          "carbs": 65,
          "fat": 6
        }
      },
      "lunch": {
        "name": "Tuna Salad",
        "ingredients": ["1 can tuna", "mixed greens", "olive oil"],
        "instructions": "Mix tuna with greens, drizzle with olive oil",
        "nutrition": {
          "calories": 320,
          "protein": 30,
          "carbs": 8,
          "fat": 18
        }
      },
      "dinner": {
        "name": "Grilled Chicken",
        "ingredients": ["200g chicken breast", "steamed broccoli", "sweet potato"],
        "instructions": "Grill chicken, serve with steamed vegetables",
        "nutrition": {
          "calories": 480,
          "protein": 40,
          "carbs": 35,
          "fat": 15
        }
      },
      "snacks": [
        {
          "name": "Protein Shake",
          "ingredients": ["1 scoop protein powder", "1 cup milk"],
          "instructions": "Blend protein powder with milk",
          "nutrition": {
            "calories": 200,
            "protein": 25,
            "carbs": 12,
            "fat": 3
          }
        },
        {
          "name": "Banana",
          "ingredients": ["1 medium banana"],
          "instructions": "Eat fresh",
          "nutrition": {
            "calories": 105,
            "protein": 1,
            "carbs": 27,
            "fat": 0
          }
        }
      ]
    },
    "Wednesday": {
      "breakfast": {
        "name": "Avocado Toast",
        "ingredients": ["2 slices bread", "1 avocado", "salt and pepper"],
        "instructions": "Toast bread, mash avocado, spread on toast",
        "nutrition": {
          "calories": 420,
          "protein": 12,
          "carbs": 45,
          "fat": 22
        }
      },
      "lunch": {
        "name": "Quinoa Bowl",
        "ingredients": ["1 cup quinoa", "vegetables", "olive oil"],
        "instructions": "Cook quinoa, mix with vegetables and oil",
        "nutrition": {
          "calories": 380,
          "protein": 14,
          "carbs": 58,
          "fat": 12
        }
      },
      "dinner": {
        "name": "Salmon with Rice",
        "ingredients": ["150g salmon", "1 cup rice", "asparagus"],
        "instructions": "Bake salmon, serve with rice and asparagus",
        "nutrition": {
          "calories": 550,
          "protein": 35,
          "carbs": 45,
          "fat": 22
        }
      },
      "snacks": [
        {
          "name": "Trail Mix",
          "ingredients": ["30g mixed nuts", "dried fruit"],
          "instructions": "Mix nuts and dried fruit",
          "nutrition": {
            "calories": 180,
            "protein": 5,
            "carbs": 15,
            "fat": 12
          }
        },
        {
          "name": "Cottage Cheese",
          "ingredients": ["1 cup cottage cheese", "berries"],
          "instructions": "Top cottage cheese with berries",
          "nutrition": {
            "calories": 160,
            "protein": 20,
            "carbs": 12,
            "fat": 2
          }
        }
      ]
    },
    "Thursday": {
      "breakfast": {
        "name": "Smoothie Bowl",
        "ingredients": ["1 banana", "berries", "protein powder", "granola"],
        "instructions": "Blend banana and berries, top with granola",
        "nutrition": {
          "calories": 400,
          "protein": 22,
          "carbs": 55,
          "fat": 8
        }
      },
      "lunch": {
        "name": "Turkey Wrap",
        "ingredients": ["whole wheat tortilla", "turkey slices", "vegetables"],
        "instructions": "Wrap turkey and vegetables in tortilla",
        "nutrition": {
          "calories": 350,
          "protein": 25,
          "carbs": 35,
          "fat": 12
        }
      },
      "dinner": {
        "name": "Pasta with Vegetables",
        "ingredients": ["whole wheat pasta", "mixed vegetables", "olive oil"],
        "instructions": "Cook pasta, toss with vegetables and oil",
        "nutrition": {
          "calories": 420,
          "protein": 15,
          "carbs": 68,
          "fat": 12
        }
      },
      "snacks": [
        {
          "name": "Hummus with Veggies",
          "ingredients": ["hummus", "carrot sticks", "cucumber"],
          "instructions": "Dip vegetables in hummus",
          "nutrition": {
            "calories": 140,
            "protein": 6,
            "carbs": 15,
            "fat": 7
          }
        },
        {
          "name": "Almonds",
          "ingredients": ["30g almonds"],
          "instructions": "Eat raw",
          "nutrition": {
            "calories": 170,
            "protein": 6,
            "carbs": 6,
            "fat": 15
          }
        }
      ]
    },
    "Friday": {
      "breakfast": {
        "name": "Pancakes",
        "ingredients": ["pancake mix", "berries", "maple syrup"],
        "instructions": "Make pancakes, top with berries and syrup",
        "nutrition": {
          "calories": 450,
          "protein": 12,
          "carbs": 75,
          "fat": 12
        }
      },
      "lunch": {
        "name": "Chicken Salad",
        "ingredients": ["grilled chicken", "mixed greens", "dressing"],
        "instructions": "Toss chicken with greens and dressing",
        "nutrition": {
          "calories": 320,
          "protein": 28,
          "carbs": 12,
          "fat": 18
        }
      },
      "dinner": {
        "name": "Beef Tacos",
        "ingredients": ["ground beef", "taco shells", "cheese", "lettuce"],
        "instructions": "Cook beef, assemble tacos with toppings",
        "nutrition": {
          "calories": 480,
          "protein": 30,
          "carbs": 25,
          "fat": 28
        }
      },
      "snacks": [
        {
          "name": "Protein Bar",
          "ingredients": ["protein bar"],
          "instructions": "Eat as is",
          "nutrition": {
            "calories": 200,
            "protein": 20,
            "carbs": 15,
            "fat": 8
          }
        },
        {
          "name": "Berries",
          "ingredients": ["1 cup mixed berries"],
          "instructions": "Eat fresh",
          "nutrition": {
            "calories": 80,
            "protein": 1,
            "carbs": 20,
            "fat": 0
          }
        }
      ]
    },
    "Saturday": {
      "breakfast": {
        "name": "French Toast",
        "ingredients": ["bread", "eggs", "milk", "cinnamon"],
        "instructions": "Dip bread in egg mixture, cook until golden",
        "nutrition": {
          "calories": 420,
          "protein": 18,
          "carbs": 45,
          "fat": 18
        }
      },
      "lunch": {
        "name": "Rice Bowl",
        "ingredients": ["rice", "vegetables", "soy sauce"],
        "instructions": "Cook rice, stir-fry vegetables, combine",
        "nutrition": {
          "calories": 380,
          "protein": 12,
          "carbs": 68,
          "fat": 8
        }
      },
      "dinner": {
        "name": "Grilled Fish",
        "ingredients": ["fish fillet", "quinoa", "vegetables"],
        "instructions": "Grill fish, serve with quinoa and vegetables",
        "nutrition": {
          "calories": 450,
          "protein": 35,
          "carbs": 35,
          "fat": 18
        }
      },
      "snacks": [
        {
          "name": "Yogurt Parfait",
          "ingredients": ["yogurt", "granola", "berries"],
          "instructions": "Layer yogurt, granola, and berries",
          "nutrition": {
            "calories": 220,
            "protein": 12,
            "carbs": 35,
            "fat": 5
          }
        },
        {
          "name": "Dark Chocolate",
          "ingredients": ["30g dark chocolate"],
          "instructions": "Eat mindfully",
          "nutrition": {
            "calories": 150,
            "protein": 2,
            "carbs": 12,
            "fat": 10
          }
        }
      ]
    },
    "Sunday": {
      "breakfast": {
        "name": "Breakfast Burrito",
        "ingredients": ["tortilla", "eggs", "cheese", "vegetables"],
        "instructions": "Scramble eggs, wrap with cheese and vegetables",
        "nutrition": {
          "calories": 450,
          "protein": 22,
          "carbs": 35,
          "fat": 25
        }
      },
      "lunch": {
        "name": "Soup and Sandwich",
        "ingredients": ["vegetable soup", "whole grain bread", "turkey"],
        "instructions": "Heat soup, make sandwich",
        "nutrition": {
          "calories": 400,
          "protein": 20,
          "carbs": 50,
          "fat": 12
        }
      },
      "dinner": {
        "name": "Stir-Fry",
        "ingredients": ["chicken", "vegetables", "rice", "soy sauce"],
        "instructions": "Stir-fry chicken and vegetables, serve over rice",
        "nutrition": {
          "calories": 480,
          "protein": 32,
          "carbs": 45,
          "fat": 18
        }
      },
      "snacks": [
        {
          "name": "Smoothie",
          "ingredients": ["banana", "spinach", "protein powder", "milk"],
          "instructions": "Blend all ingredients",
          "nutrition": {
            "calories": 250,
            "protein": 20,
            "carbs": 30,
            "fat": 6
          }
        },
        {
          "name": "Crackers and Cheese",
          "ingredients": ["whole grain crackers", "cheese"],
          "instructions": "Serve crackers with cheese",
          "nutrition": {
            "calories": 180,
            "protein": 8,
            "carbs": 15,
            "fat": 10
          }
        }
      ]
    }
  },
  "weeklyTotals": {
    "averageCalories": 1850,
    "averageProtein": 103,
    "averageCarbs": 177,
    "averageFat": 68
  },
  "shoppingList": [
    "Eggs",
    "Whole grain bread",
    "Chicken breast",
    "Mixed vegetables",
    "Rice",
    "Quinoa",
    "Greek yogurt",
    "Berries",
    "Nuts",
    "Olive oil"
  ],
  "tips": [
    "Prep ingredients on Sunday for the week",
    "Cook grains in bulk and store in refrigerator",
    "Wash and chop vegetables when you get home from shopping",
    "Use proper portion sizes for your fitness goals",
    "Stay hydrated throughout the day"
  ]
}

Now create a similar meal plan using the provided ingredients: ${ingredients.join(', ')} and preferences: ${preferences || 'balanced nutrition'}. Make sure to use the exact JSON format above.`

    // Generate meal plan using Gemini
    const { text } = await generateText({
      model: geminiModel,
      prompt: prompt,
      temperature: 0.7,
      maxTokens: 4000,
    })

    // Clean up the response text to extract JSON
    let jsonText = text.trim()
    
    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '')
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '')
    }
    
    // Try to parse the JSON response
    let parsedPlan
    try {
      parsedPlan = JSON.parse(jsonText)
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      console.error('Raw response:', text)
      
      // Try to extract JSON from the response if it contains other text
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          parsedPlan = JSON.parse(jsonMatch[0])
        } catch (secondParseError) {
          return NextResponse.json({ 
            success: false, 
            error: 'Could not parse the generated meal plan. Please try again.',
            parsed: false,
            rawText: text
          })
        }
      } else {
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid response format from AI. Please try again.',
          parsed: false,
          rawText: text
        })
      }
    }

    // Validate the structure
    if (!parsedPlan.weeklyPlan || !parsedPlan.weeklyTotals) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid meal plan structure. Please try again.',
        parsed: false,
        rawText: text
      })
    }

    return NextResponse.json({ 
      success: true,
      mealPlan: parsedPlan,
      parsed: true,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error generating meal plan:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate meal plan' },
      { status: 500 }
    )
  }
}
