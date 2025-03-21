<template>
  <h1
    :class="{ active: true, disabled: false }"
    :style="{ background: '#F00', width: 0 }"
    :title="{ a: 2 }"
  >
    Text
  </h1>
</template>

<script>
export default {
  name: 'AttributesNotToStringify'
};
</script>
