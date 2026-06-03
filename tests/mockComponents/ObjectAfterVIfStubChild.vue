<template>
  <div>{{ obj?.a }}</div>
</template>

<script>
export default {
  name: 'ObjectAfterVIfStubChild',
  props: ['myObj', 'myArr']
};
</script>
