<template>
  <div>
    <h1 :title="{ x: 'asdf' }">Te<s>xt</s></h1>
  </div>
  <p title="plain text">
    <strong :title="22">Text</strong>
  </p>
  <h2 :title="value">Words</h2>
  <div :title="() => { return 5; }">
    <span :title="[true, 2, 'string']">
      <em>Some</em> stuff.
    </span>
  </div>
  <StringifyProps :person="{ name: 'bob' }" />
</template>

<script>
import StringifyProps from '@@/mockComponents/StringifyProps.vue';

export default {
  name: 'StringifyAttributes',
  components: {
    StringifyProps
  },
  data: function () {
    return {
      value: { y: 2 }
    }
  }
};
</script>
