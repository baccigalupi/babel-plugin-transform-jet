import assert from "assert"
import { transform, ignoreWhitespace } from './helper'

describe("Easley jet template transformation", () => {
  it("converts a self-closing html tag without attributes", () => {
    const input = `<div />`

    const expectedOutput = `Easley.Jet.create("div", null);`

    assert.equal(
      ignoreWhitespace(transform(input).code),
      ignoreWhitespace(expectedOutput)
    )
  })

  it("converts a self-closing html tag with attributes", () => {
    const input = `<div class="foo" onClick="javascript:void(0)" />`

    const expectedOutput = `Easley.Jet.create("div", {
      class: "foo",
      onClick: "javascript:void(0)"
    });`

    assert.equal(
      ignoreWhitespace(transform(input).code),
      ignoreWhitespace(expectedOutput)
    )
  })

  it("converts a open/close html tag with values and attributes", () => {
    const input = `<div class="foo">Foo</div>`

    const expectedOutput = `Easley.Jet.create("div", {
      class: "foo"
    }, "Foo");`

    assert.equal(
      ignoreWhitespace(transform(input).code),
      ignoreWhitespace(expectedOutput)
    )
  })

  it("raises an error when there is no closing tag, and it is not self-closed", () => {
    const input = `<div>`
    assert.throws(() => { transform(input) }, { message: /Unexpected token/})
  })

  it("allows namespacing in xml by default", () => {
    const input = `<homepage xlink:type="simple" xlink:href="https://www.w3schools.com" />`
    const expectedOutput = `Easley.Jet.create("homepage",{
      "xlink:type" : "simple",
      "xlink:href" : "https://www.w3schools.com"
    });`
    let output
    assert.doesNotThrow(() => {
      output = transform(input)
    })
    assert.equal(ignoreWhitespace(output.code), ignoreWhitespace(expectedOutput))
  })

  it("prevents es6 module import statements", () => {
    const input = `
      import Foo from "foo"
    `
    assert.throws(() => { transform(input) }, { message: /Jet templates are logic free/})
  })

  it("prevents es6 module export default statements", () => {
    const input = `
      export default "foo"
    `
    assert.throws(() => { transform(input) }, { message: /Jet templates are logic free/})
  })

  it("prevents es6 module export all statements", () => {
    const input = `
      export * from "foo"
    `
    assert.throws(() => { transform(input) }, { message: /Jet templates are logic free/})
  })

  it("prevents es6 module named export statements", () => {
    const input = `
      const a = "a"
      const b = "b"
      export { a, b as c }
    `
    assert.throws(() => { transform(input) }, { message: /Jet templates are logic free/})
  })

  it("prevents es6 module export specifier statements", () => {
    const input = `
      export { transform } from "@babel/core"
    `
    assert.throws(() => { transform(input) }, { message: /Jet templates are logic free/})
  })

  it("does not allow assignment", () => {
    const input = `
      a = "a"
    `
    assert.throws(() => { transform(input) }, { message: /Jet templates are logic free/})
  })

  it("does not fat arrow functions", () => {
    const input = `
      (foo) => { return foo + 2 }
    `
    assert.throws(() => { transform(input) }, { message: /Jet templates are logic free/})
  })

  // ------

  it("allows nested member expressions interpolation", () => {
    const input = `
      <a>{ foo.bar.zardoz }</a>
    `
    const expectedOutput = `Easley.Jet.create("a", null, foo.bar.zardoz);`
    assert.equal(
      ignoreWhitespace(transform(input).code),
      ignoreWhitespace(expectedOutput)
    )
  })

  it("does not allow member calls", () => {
    const input = `
      <a>{ foo.bar.zardoz() }</a>
    `
    assert.throws(() => { transform(input) }, { message: /Jet templates are logic free/})
  })

  it("does not allow interpolated expressions", () => {
    const input = `
      <a>{ 1 + 1 }</a>
    `
    assert.throws(() => { transform(input) }, { message: /Jet templates are logic free/})
  })

  it("does not allow ternary expressions", () => {
    const input = `
      <a>{ foo ? "foo" : "bar" }</a>
    `
    assert.throws(() => { transform(input) }, { message: /Jet templates are logic free/})
  })

  it("does not allow logical && statements for conditional-ing", () => {
    const input = `
      <a>{ isTwo && "2" }</a>
    `
    assert.throws(() => { transform(input) }, { message: /Jet templates are logic free/})
  })

  it("does not allow templates", () => {
    const input = "<a>{ `1-${way}` }</a>"
    assert.throws(() => { transform(input) }, { message: /Jet templates are logic free/})
  })
})