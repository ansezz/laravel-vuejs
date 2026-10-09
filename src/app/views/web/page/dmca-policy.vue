<template>
    <section class="dmca-container">
        <breadcrumb :pages="breadcrumbsData"/>
        <div class="small-container">
            <header>
                <div class="user-avatar">
                    <img src="@/assets/images/icons-page.svg" alt="LV">
                </div>
                <h1>DMCA Policy</h1>
            </header>
            <div class="terms-desc">
                <p>
                    laravel-vuejs.space (“Company”) has adopted the following policy toward copyright infringement in
                    accordance with the Digital Millennium Copyright Act
                    (http://www.copyright.gov/legislation/dmca.pdf). The address of the Designated Agent to Receive
                    Notification of Claimed Infringement (“Designated Agent”) is listed at the end of this policy.

                </p>
                <p>
                    <a href="https://laravel-vuejs.space"> Laravel-VueJs.space</a> – DMCA COPYRIGHT POLICY
                    Reporting Copyright Infringement:
                </p>
                <p>

                    If you allege that your intellectual property is being violated, you must submit to the Company:

                    A physical or electronic signature of a person authorized to act on behalf of the owner of the
                    copyright that has been allegedly infringed;
                    Identification of the works or materials being infringed;
                    Identification of the material that is claimed to be infringing including information regarding the
                    specific location of the infringing materials on the Company’s website that the copyright owner
                    seeks to have removed, with sufficient detail so that Company is capable of finding and verifying
                    its existence;
                    Contact information of the person notifying the Company, including address, telephone number and, if
                    available, e-mail address;
                    A statement that the notifier has a good faith belief that the material is not authorized by the
                    copyright owner, its agent, or the law; and
                    A statement made under penalty of perjury that the information provided is accurate and the
                    notifying party is authorized to make the complaint on behalf of the copyright owner.
                </p>
                <p>

                    Once Proper Bona Fide Infringement Notification is Received by the Designated Agent:

                    It is Company’s policy:

                    to remove or disable access to the infringing material;
                    to notify the content provider, member or user that it has removed or disabled access to the
                    material; and
                    that repeat offenders will have the infringing material removed from the system and that Company
                    will terminate such content provider’s, member’s or user’s access to the service.
                </p>
                <p>
                    Procedure to Supply a Counter-Notice to the Designated Agent:

                    A physical or electronic signature of the content provider, member or user;
                    Identification of the material that has been removed or to which access has been disabled and the
                    location at which the material appeared before it was removed or disabled;
                    A statement that the content provider, member or user has a good faith belief that the material was
                    removed or disabled as a result of mistake or a misidentification of the material; and
                    Content provider’s, member’s or user’s name, address, telephone number, and, if available, e-mail
                    address and a statement that such person or entity consents to the jurisdiction of the Federal Court
                    for the judicial district in which the content provider’s, member’s or user’s address is located, or
                    if the content provider’s, member’s or user’s address is located outside the United States, for any
                    judicial district in which Company is located, and that such person or entity will accept service of
                    process from the person who provided notification of the alleged infringement.

                    If a counter-notice is received by the Designated Agent, Company may send a copy of the
                    counter-notice to the original complaining party informing that person that it may replace the
                    removed material or cease disabling it in 10 business days. Unless the copyright owner files an
                    action seeking a court order against the content provider, member or user, the removed material may
                    be replaced or access to it restored in 10 to 14 business days or more after receipt of the
                    counter-notice, at Company’s discretion.

                    Please contact the Designated Agent to Receive Notification of Claimed Infringement for Company at
                    {{ contactEmail }}
                </p>
            </div>
        </div>
    </section>
</template>

<script>
import { CONTACT_EMAIL } from '@/config/site.js'
import __Breadcrumb from '@/components/shared/partials/elements/breadcrumb'
export default {
        components: {},
        name: "dmca-policy",
        components: {
            Breadcrumb: __Breadcrumb
        },
        data() {
            return {
                contactEmail: CONTACT_EMAIL,
                opened: true,
                breadcrumbsData: [{
                    name: 'Home',
                    link: "/"
                },
                    {
                        name: 'Pages',
                    },
                    {
                        name: 'DMCA Policy'
                    }
                ]
            }
        },
    }
</script>

<style lang="stylus" scoped>
    .dmca-container
        padding-bottom 30px
    header
        text-align center
        margin 60px 0 30px
        h1
            font-size 28px
            font-weight 600
            color $tertiary
            margin 10px 0
            line-height 1.4
    .terms-desc
      p
        font-size 18px
        line-height 28px
        color #616d82
        margin-bottom 20px
</style>
