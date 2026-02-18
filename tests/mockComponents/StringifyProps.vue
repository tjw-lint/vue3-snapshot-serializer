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
    person: {
      type: Object,
      default: undefined
    },
    camelCaseProp: {
      type: Object,
      default: undefined
    }
  }
};
</script>
