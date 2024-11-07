<template>
  <div :title="person">
    {{ person.name }}
  </div>
</template>

<script>
export default {
  name: 'StringifyProps',
  props: {
    person: {
      type: Object,
      default: undefined
    }
  }
};
</script>
