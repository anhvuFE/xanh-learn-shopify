import {
  Page,
  Layout,
  Card,
  Button,
  Text,
  BlockStack,
  InlineGrid,
  Divider,
  Badge,
  Icon,
  InlineStack,
  Box,
  Banner,
  List,
} from "@shopify/polaris";
import {
  CheckIcon,
  StarFilledIcon,
  StarIcon,
  AlertDiamondIcon,
  ClockIcon,
  PhoneIcon,
  EmailIcon,
  MobileIcon,
  ChartVerticalFilledIcon,
  ImportIcon,
  TeamIcon,
  KeyIcon,
  HeartIcon,
} from "@shopify/polaris-icons";
import { useState } from "react";
import { TitleBar } from "@shopify/app-bridge-react";

interface PricingPlan {
  name: string;
  icon: any;
  price: string;
  originalPrice?: string;
  period: string;
  description: string;
  features: { text: string; icon?: any }[];
  recommended?: boolean;
  buttonText: string;
  badge?: string;
  color?: string;
}

export default function AdditionalPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const pricingPlans: PricingPlan[] = [
    {
      name: "Starter",
      icon: StarFilledIcon,
      price: billingCycle === "monthly" ? "$9" : "$90",
      originalPrice: billingCycle === "yearly" ? "$108" : undefined,
      period: billingCycle === "monthly" ? "/month" : "/year",
      description: "Perfect for small businesses just getting started",
      color: "base",
      features: [
        { text: "Up to 100 products", icon: CheckIcon },
        { text: "Basic analytics dashboard", icon: ChartVerticalFilledIcon },
        { text: "Email support", icon: EmailIcon },
        { text: "1 staff account", icon: TeamIcon },
        { text: "Mobile app access", icon: MobileIcon },
        { text: "Standard SSL security", icon: KeyIcon },
      ],
      buttonText: "Start 14-Day Free Trial",
    },
    {
      name: "Professional",
      icon: StarIcon,
      price: billingCycle === "monthly" ? "$29" : "$290",
      originalPrice: billingCycle === "yearly" ? "$348" : undefined,
      period: billingCycle === "monthly" ? "/month" : "/year",
      description: "Everything you need to grow your business",
      recommended: true,
      badge: "MOST POPULAR",
      color: "success",
      features: [
        { text: "Unlimited products", icon: CheckIcon },
        { text: "Advanced analytics & custom reports", icon: ChartVerticalFilledIcon },
        { text: "Priority email & live chat support", icon: HeartIcon },
        { text: "5 staff accounts", icon: TeamIcon },
        { text: "Mobile app with push notifications", icon: MobileIcon },
        { text: "Custom branding & white-label", icon: StarFilledIcon },
        { text: "Full API access", icon: KeyIcon },
        { text: "Bulk import/export tools", icon: ImportIcon },
        { text: "Automated backups", icon: ClockIcon },
      ],
      buttonText: "Start 14-Day Free Trial",
    },
    {
      name: "Enterprise",
      icon: AlertDiamondIcon,
      price: billingCycle === "monthly" ? "$99" : "$990",
      originalPrice: billingCycle === "yearly" ? "$1188" : undefined,
      period: billingCycle === "monthly" ? "/month" : "/year",
      description: "Advanced features for scaling businesses",
      badge: "BEST VALUE",
      color: "attention",
      features: [
        { text: "Unlimited everything", icon: CheckIcon },
        { text: "Real-time analytics & AI insights", icon: ChartVerticalFilledIcon },
        { text: "24/7 phone, email & chat support", icon: PhoneIcon },
        { text: "Unlimited staff accounts", icon: TeamIcon },
        { text: "Priority mobile features", icon: MobileIcon },
        { text: "Complete white-label solution", icon: StarFilledIcon },
        { text: "Advanced API with webhooks", icon: KeyIcon },
        { text: "Dedicated account manager", icon: HeartIcon },
        { text: "Custom integrations", icon: ImportIcon },
        { text: "Free training & onboarding", icon: StarIcon },
        { text: "99.9% uptime SLA", icon: ClockIcon },
        { text: "Advanced security & compliance", icon: KeyIcon },
      ],
      buttonText: "Contact Sales Team",
    },
  ];

  const handleSelectPlan = (planName: string) => {
    setSelectedPlan(planName);
    console.log(`Selected plan: ${planName}`);
  };

  const testimonials = [
    {
      author: "Sarah Chen",
      company: "TechStart Inc.",
      text: "The Professional plan transformed how we manage our inventory. Worth every penny!",
    },
    {
      author: "Mike Rodriguez",
      company: "Fashion Forward",
      text: "Enterprise support is incredible. They helped us scale from 100 to 10,000 products seamlessly.",
    },
    {
      author: "Emma Williams",
      company: "Green Gardens",
      text: "Simple, powerful, and affordable. The Starter plan was perfect for launching our business.",
    },
  ];

  return (
    <Page>
      <TitleBar title="Choose Your Plan" />
      <Layout>
        <Layout.Section>
          <Box paddingBlockEnd="800">
            <BlockStack gap="600">
              <BlockStack gap="400" inlineAlign="center">
                <Badge tone="info" size="large">
                  LIMITED TIME: Save 20% on Annual Plans
                </Badge>
                <Text as="h1" variant="heading3xl" alignment="center">
                  Simple, Transparent Pricing
                </Text>
                <Text as="p" variant="headingMd" alignment="center" tone="subdued">
                  Join 50,000+ businesses using our platform to grow
                </Text>
              </BlockStack>

              <Box paddingBlockStart="400">
                <InlineStack gap="200" align="center" blockAlign="center">
                  <Button
                    variant={billingCycle === "monthly" ? "primary" : "secondary"}
                    onClick={() => setBillingCycle("monthly")}
                  >
                    Monthly Billing
                  </Button>
                  <Button
                    variant={billingCycle === "yearly" ? "primary" : "secondary"}
                    onClick={() => setBillingCycle("yearly")}
                  >
                    Annual Billing (Save 20%)
                  </Button>
                </InlineStack>
              </Box>
            </BlockStack>
          </Box>
        </Layout.Section>

        <Layout.Section>
          <InlineGrid columns={{ xs: 1, sm: 1, md: 3 }} gap="400">
            {pricingPlans.map((plan) => (
              <Box
                key={plan.name}
                borderRadius="300"
                background={plan.recommended ? "bg-surface-success-subdued" : "bg-surface"}
                borderWidth={plan.recommended ? "025" : "0"}
                borderColor={plan.recommended ? "border-success" : undefined}
                position="relative"
              >
                <Card>
                  <BlockStack gap="500">
                    {plan.badge && (
                      <Box position="absolute" insetBlockStart="0" insetInlineEnd="0">
                        <Badge tone={plan.recommended ? "success" : "attention"} size="large">
                          {plan.badge}
                        </Badge>
                      </Box>
                    )}

                    <BlockStack gap="300" inlineAlign="center">
                      <Box padding="200" background="bg-surface-secondary" borderRadius="full">
                        <Icon source={plan.icon} tone={plan.color as any || "base"} />
                      </Box>
                      <Text as="h3" variant="headingLg" alignment="center">
                        {plan.name}
                      </Text>
                      <Text as="p" variant="bodyMd" tone="subdued" alignment="center">
                        {plan.description}
                      </Text>
                    </BlockStack>

                    <Box paddingBlock="400">
                      <BlockStack gap="200" inlineAlign="center">
                        <InlineStack gap="200" blockAlign="end" align="center">
                          <Text as="span" variant="heading3xl" fontWeight="bold">
                            {plan.price}
                          </Text>
                          <Text as="span" variant="bodyLg" tone="subdued">
                            {plan.period}
                          </Text>
                        </InlineStack>
                        {plan.originalPrice && (
                          <Text as="p" variant="bodyMd" tone="subdued" alignment="center">
                            <s>{plan.originalPrice}</s> Save {billingCycle === "yearly" ? "20%" : ""}
                          </Text>
                        )}
                      </BlockStack>
                    </Box>

                    <Divider />

                    <BlockStack gap="300">
                      <Text as="p" variant="bodyMd" fontWeight="semibold">
                        Everything included:
                      </Text>
                      <List gap="tight">
                        {plan.features.map((feature, index) => (
                          <List.Item key={index}>
                            <InlineStack gap="200" blockAlign="center">
                              <Box minWidth="20">
                                <Icon source={feature.icon || CheckIcon} tone="success" />
                              </Box>
                              <Text as="span" variant="bodyMd">
                                {feature.text}
                              </Text>
                            </InlineStack>
                          </List.Item>
                        ))}
                      </List>
                    </BlockStack>

                    <Box paddingBlockStart="400">
                      <Button
                        fullWidth
                        variant={plan.recommended ? "primary" : "secondary"}
                        size="large"
                        onClick={() => handleSelectPlan(plan.name)}
                        tone={plan.recommended ? "success" : undefined}
                      >
                        {plan.buttonText}
                      </Button>
                    </Box>
                  </BlockStack>
                </Card>
              </Box>
            ))}
          </InlineGrid>
        </Layout.Section>

        <Layout.Section>
          <Box paddingBlockStart="1600">
            <Card>
              <BlockStack gap="600">
                <Text as="h2" variant="headingXl" alignment="center">
                  Trusted by Thousands of Businesses
                </Text>
                <InlineGrid columns={{ xs: 1, sm: 1, md: 3 }} gap="400">
                  {testimonials.map((testimonial, index) => (
                    <Box key={index} padding="400" background="bg-surface-secondary" borderRadius="200">
                      <BlockStack gap="300">
                        <Text as="p" variant="bodyMd" fontWeight="semibold">
                          "{testimonial.text}"
                        </Text>
                        <BlockStack gap="100">
                          <Text as="p" variant="bodyMd" fontWeight="semibold">
                            {testimonial.author}
                          </Text>
                          <Text as="p" variant="bodySm" tone="subdued">
                            {testimonial.company}
                          </Text>
                        </BlockStack>
                      </BlockStack>
                    </Box>
                  ))}
                </InlineGrid>
              </BlockStack>
            </Card>
          </Box>
        </Layout.Section>

        <Layout.Section>
          <Box paddingBlockStart="800">
            <Card>
              <BlockStack gap="600">
                <Text as="h3" variant="headingLg" alignment="center">
                  Frequently Asked Questions
                </Text>

                <InlineGrid columns={{ xs: 1, sm: 1, md: 2 }} gap="400">
                  <BlockStack gap="200">
                    <Text as="p" variant="bodyMd" fontWeight="bold">
                      What payment methods do you accept?
                    </Text>
                    <Text as="p" variant="bodyMd" tone="subdued">
                      We accept all major credit cards, PayPal, wire transfers, and ACH for annual plans.
                    </Text>
                  </BlockStack>

                  <BlockStack gap="200">
                    <Text as="p" variant="bodyMd" fontWeight="bold">
                      Can I change my plan anytime?
                    </Text>
                    <Text as="p" variant="bodyMd" tone="subdued">
                      Yes! Upgrade or downgrade anytime. Changes take effect immediately.
                    </Text>
                  </BlockStack>

                  <BlockStack gap="200">
                    <Text as="p" variant="bodyMd" fontWeight="bold">
                      What's your cancellation policy?
                    </Text>
                    <Text as="p" variant="bodyMd" tone="subdued">
                      Cancel anytime with no penalties. You'll have access until the end of your billing period.
                    </Text>
                  </BlockStack>

                  <BlockStack gap="200">
                    <Text as="p" variant="bodyMd" fontWeight="bold">
                      Do you offer customer support?
                    </Text>
                    <Text as="p" variant="bodyMd" tone="subdued">
                      Yes! All plans include support. Higher tiers get priority and phone support.
                    </Text>
                  </BlockStack>
                </InlineGrid>
              </BlockStack>
            </Card>
          </Box>
        </Layout.Section>

        <Layout.Section>
          <Box paddingBlockStart="1200" paddingBlockEnd="800">
            <Banner
              title="Need a custom solution?"
              tone="info"
              action={{
                content: "Contact Sales",
                onAction: () => console.log("Contact sales clicked"),
              }}
              secondaryAction={{
                content: "Schedule Demo",
                onAction: () => console.log("Schedule demo clicked"),
              }}
            >
              <p>
                We offer custom pricing for large teams and specific requirements.
                Get in touch with our sales team to discuss your needs.
              </p>
            </Banner>
          </Box>
        </Layout.Section>

        <Layout.Section>
          <Box padding="800" background="bg-surface-secondary" borderRadius="300">
            <BlockStack gap="400" inlineAlign="center">
              <Text as="h3" variant="headingMd" alignment="center">
                30-Day Money-Back Guarantee
              </Text>
              <Text as="p" variant="bodyMd" tone="subdued" alignment="center">
                Try any plan risk-free. If you're not completely satisfied within 30 days, we'll refund your money.
              </Text>
            </BlockStack>
          </Box>
        </Layout.Section>
      </Layout>
    </Page>
  );
}