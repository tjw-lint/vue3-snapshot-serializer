<template>
  <div>
    <h1 v-if="hasHeader">Header</h1>
    <ObjectAfterVIfStubChild
      :obj="{ a: { b: ['c'] } }"
      :arr="['c']"
    />
  </div>
</template>

<script>
import ObjectAfterVIfStubChild from './ObjectAfterVIfStubChild.vue';

export default {
  name: 'ObjectAfterVIfStubParent',
  components: {
    ObjectAfterVIfStubChild
  },
  data: function () {
    return {
      hasHeader: true
    };
  }
};
</script>
