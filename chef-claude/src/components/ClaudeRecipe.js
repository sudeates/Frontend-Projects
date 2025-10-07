import React from 'react'
import ReactMarkdown from 'react-markdown'

function ClaudeRecipe(props) {
  return (
        <section>
          <ReactMarkdown>
            {props.recipe}
          </ReactMarkdown>
            
        </section>
  )
}

export default ClaudeRecipe


  