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
} from "@shopify/polaris";
import { CheckIcon } from "@shopify/polaris-icons";
import { useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return json({});
};

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  recommended?: boolean;
  buttonText: string;
}

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>("");

  const pricingPlans: PricingPlan[] = [
    {
      name: "Starter",
      price: "$9",
      period: "/month",
      description: "Perfect for small businesses just getting started",
      features: [
        "Up to 100 products",
        "Basic analytics",
        "Email support",
        "1 staff account",
        "Mobile app access",
      ],
      buttonText: "Start Free Trial",
    },
    {
      name: "Professional",
      price: "$29",
      period: "/month",
      description: "Everything you need to grow your business",
      features: [
        "Unlimited products",
        "Advanced analytics & reports",
        "Priority email & chat support",
        "5 staff accounts",
        "Mobile app access",
        "Custom branding",
        "API access",
        "Bulk import/export",
      ],
      recommended: true,
      buttonText: "Start Free Trial",
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "/month",
      description: "Advanced features for scaling businesses",
      features: [
        "Unlimited everything",
        "Real-time analytics",
        "24/7 phone & email support",
        "Unlimited staff accounts",
        "Mobile app access",
        "White-label options",
        "Full API access",
        "Dedicated account manager",
        "Custom integrations",
        "Training & onboarding",
      ],
      buttonText: "Contact Sales",
    },
  ];

  const handleSelectPlan = (planName: string) => {
    setSelectedPlan(planName);
    console.log(`Selected plan: ${planName}`);
  };

  return (
    <Page title="Pricing Plans">
      <Layout>
        <Layout.Section>
          <Box paddingBlockEnd="800">
            <BlockStack gap="400">
              <Text as="h2" variant="headingLg" alignment="center">
                Choose the perfect plan for your business
              </Text>
              <Text as="p" variant="bodyLg" alignment="center" tone="subdued">
                Start with a 14-day free trial. No credit card required.
              </Text>
            </BlockStack>
          </Box>
        </Layout.Section>

        <Layout.Section>
          <InlineGrid columns={{ xs: 1, sm: 1, md: 3 }} gap="400">
            {pricingPlans.map((plan) => (
              <Card key={plan.name}>
                <BlockStack gap="400">
                  {plan.recommended && (
                    <Box>
                      <Badge tone="success">Most Popular</Badge>
                    </Box>
                  )}

                  <BlockStack gap="200">
                    <Text as="h3" variant="headingMd">
                      {plan.name}
                    </Text>
                    <InlineStack gap="100" blockAlign="end">
                      <Text as="span" variant="heading2xl" fontWeight="bold">
                        {plan.price}
                      </Text>
                      <Text as="span" variant="bodyLg" tone="subdued">
                        {plan.period}
                      </Text>
                    </InlineStack>
                    <Text as="p" variant="bodyMd" tone="subdued">
                      {plan.description}
                    </Text>
                  </BlockStack>

                  <Divider />

                  <BlockStack gap="300">
                    <Text as="p" variant="bodyMd" fontWeight="semibold">
                      Features included:
                    </Text>
                    <BlockStack gap="200">
                      {plan.features.map((feature, index) => (
                        <InlineStack key={index} gap="200" blockAlign="start">
                          <Icon source={CheckIcon} tone="success" />
                          <Text as="span" variant="bodyMd">
                            {feature}
                          </Text>
                        </InlineStack>
                      ))}
                    </BlockStack>
                  </BlockStack>

                  <Box paddingBlockStart="400">
                    <Button
                      fullWidth
                      variant={plan.recommended ? "primary" : "secondary"}
                      size="large"
                      onClick={() => handleSelectPlan(plan.name)}
                    >
                      {plan.buttonText}
                    </Button>
                  </Box>
                </BlockStack>
              </Card>
            ))}
          </InlineGrid>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h3" variant="headingMd">
                Frequently Asked Questions
              </Text>

              <BlockStack gap="300">
                <BlockStack gap="100">
                  <Text as="p" variant="bodyMd" fontWeight="semibold">
                    Can I change plans anytime?
                  </Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
                  </Text>
                </BlockStack>

                <BlockStack gap="100">
                  <Text as="p" variant="bodyMd" fontWeight="semibold">
                    What payment methods do you accept?
                  </Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    We accept all major credit cards, PayPal, and bank transfers for annual plans.
                  </Text>
                </BlockStack>

                <BlockStack gap="100">
                  <Text as="p" variant="bodyMd" fontWeight="semibold">
                    Is there a setup fee?
                  </Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    No, there are no setup fees or hidden charges. You only pay the monthly subscription fee.
                  </Text>
                </BlockStack>

                <BlockStack gap="100">
                  <Text as="p" variant="bodyMd" fontWeight="semibold">
                    Do you offer annual pricing?
                  </Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Yes, we offer a 20% discount when you pay annually. Contact our sales team for more information.
                  </Text>
                </BlockStack>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Box paddingBlockStart="800">
            <Card>
              <BlockStack gap="400" inlineAlign="center">
                <Text as="h3" variant="headingMd" alignment="center">
                  Need a custom plan?
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued" alignment="center">
                  We offer custom pricing for large organizations with specific needs
                </Text>
                <Button variant="plain">Contact our sales team</Button>
              </BlockStack>
            </Card>
          </Box>
        </Layout.Section>
      </Layout>
    </Page>
  );
}