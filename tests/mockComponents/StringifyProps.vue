<template>
  <div :title="person">
    {{ person.name }}
  </div>
  <div :title="camelCaseProp"></div>
</template>

<script>
export default {
  name: 'StringifyProps',
  props: {
    camelCaseProp: {
      type: Object,
      default: undefined
    },
    person: {
      type: Object,
      default: undefined
    }
  }
};
</script>
