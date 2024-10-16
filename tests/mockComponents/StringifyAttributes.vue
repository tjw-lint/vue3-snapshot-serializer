<template>
  <div>
    <h1 :title="{ x: 'asdf' }">Te<s>xt</s></h1>
  </div>
  <p>
    <strong>Text</strong>
  </p>
  <h2 :title="value">Words</h2>
  <div>
    <span>
      <em>Some</em> stuff.
    </span>
  </div>
</template>

<script>
export default {
  name: 'StringifyAttributes',
  data: function () {
    return {
      value: { y: 2 }
    }
  }
};
</script>
