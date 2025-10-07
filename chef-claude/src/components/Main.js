import React,{use, useState} from "react"
import ClaudeRecipe from "./ClaudeRecipe"
import IngredientsList from "./IngredientsList"
import { getRecipeFromChefClaude, getRecipeFromMistral } from "../ai"

export default function Main(){
    const [ingredients, setIngredients] = React.useState(
        ["all the main spices", "pasta", "ground beef", "tomato paste"]
    )
    const [recipe,setRecipe]=useState("")
    
    async function getRecipe(){
        const recipeMarkDown=await getRecipeFromMistral(ingredients)
        setRecipe(recipeMarkDown)
    }
    function addIngredient(formData){
        const newIngredient=formData.get("ingredient")
        setIngredients(prevIngredient=>[...prevIngredient,newIngredient])
    }
    return (
        <main>
            <form action={addIngredient} className="add-ingredient-form">
                <input  
                    type="text"
                    placeholder="e.g. oregano"
                    name="ingredient"
                    aria-label="Add ingredient"/>          
                <button>Add Ingredient</button>
            </form>
            {ingredients.length>0 &&<IngredientsList ingredients={ingredients} getRecipe={getRecipe}/>}
            {recipe && <ClaudeRecipe recipe={recipe}/>} 
        </main>
    )
}