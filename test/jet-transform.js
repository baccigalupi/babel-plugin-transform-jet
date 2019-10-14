import jetTransformer from "../lib"
import { transformSync, createConfigItem } from "@babel/core"

export default (input) => {
  return transformSync(input, {
    plugins: [
      createConfigItem(jetTransformer)
    ]
  })
}