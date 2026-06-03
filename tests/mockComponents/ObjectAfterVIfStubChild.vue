<template>
  <div>{{ myObj?.a }}</div>
</template>

<script>
export default {
  name: 'ObjectAfterVIfStubChild',
  props: ['myObj', 'myArr']
};
</script>
