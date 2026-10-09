<template>
  <component :is="socialSharing.networkTag" :tabindex="0" :data-link="dataLink" @click.prevent="socialSharing.share(network)"><slot/></component>
</template>

<script>
  export default {
    name: 'Network',
    inject: ['socialSharing'],
    props: { network: { type: String, required: true } },
    // vue-social-sharing marked popup networks with data-link="#share-<network>"
    computed: { dataLink() { return ['email', 'sms', 'whatsapp', 'telegram', 'line', 'skype'].includes(this.network) ? this.socialSharing.link(this.network) : '#share-' + this.network } },
  }
</script>
