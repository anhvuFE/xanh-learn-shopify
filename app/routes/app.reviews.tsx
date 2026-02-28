// Customer reviews and ratings management with moderation

import {
  Page,
  Layout,
  Card,
  Button,
  IndexTable,
  IndexFilters,
  useIndexResourceState,
  Text,
  Badge,
  InlineStack,
  Box,
  EmptyState,
  useBreakpoints,
  BlockStack,
  Modal,
  TextField,
  Select,
  Banner,
  Avatar,
  Thumbnail,
  Link,
  Divider,
  ProgressBar,
  Icon,
  InlineGrid,
} from "@shopify/polaris";
import type { BadgeProps, IndexTableProps } from "@shopify/polaris";
import {
  StarFilledIcon,
  StarIcon,
  CheckCircleIcon,
  XIcon,
  AlertCircleIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  FlagIcon,
} from "@shopify/polaris-icons";
import { useState, useCallback, useMemo } from "react";
import { useLoaderData, useNavigate } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

// Loader to fetch reviews data
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  // Mock data - replace with real API calls
  const reviews = [
    {
      id: "REV001",
      product: {
        id: "prod_1",
        title: "Wireless Headphones",
        image: "https://burst.shopifycdn.com/photos/black-leather-choker-necklace_373x@2x.jpg",
        variant: "Black",
      },
      customer: {
        id: "cust_1",
        name: "John Doe",
        email: "john.doe@example.com",
        avatar: "JD",
        verified: true,
      },
      rating: 5,
      title: "Best headphones I've ever owned!",
      content: "Amazing sound quality and comfort. The noise cancellation is top-notch. Battery life easily lasts all day. Highly recommend!",
      status: "published" as const,
      helpful: 45,
      notHelpful: 2,
      replies: 3,
      images: ["https://burst.shopifycdn.com/photos/black-leather-choker-necklace_373x@2x.jpg"],
      createdAt: "2024-01-25T10:30:00Z",
      publishedAt: "2024-01-25T11:00:00Z",
      featured: true,
      reported: false,
    },
    {
      id: "REV002",
      product: {
        id: "prod_2",
        title: "Running Shoes",
        image: "https://burst.shopifycdn.com/photos/wrist-watches_373x@2x.jpg",
        variant: "Blue / Size 9",
      },
      customer: {
        id: "cust_2",
        name: "Jane Smith",
        email: "jane.smith@example.com",
        avatar: "JS",
        verified: false,
      },
      rating: 4,
      title: "Great for daily runs",
      content: "Comfortable and lightweight. Good support for long runs. Only issue is they run a bit small, so order half size up.",
      status: "published" as const,
      helpful: 23,
      notHelpful: 5,
      replies: 1,
      images: [],
      createdAt: "2024-01-24T08:15:00Z",
      publishedAt: "2024-01-24T09:00:00Z",
      featured: false,
      reported: false,
    },
    {
      id: "REV003",
      product: {
        id: "prod_3",
        title: "Smart Watch",
        image: "https://burst.shopifycdn.com/photos/business-woman-smiling-in-office_373x@2x.jpg",
        variant: "Silver",
      },
      customer: {
        id: "cust_3",
        name: "Bob Johnson",
        email: "bob.johnson@example.com",
        avatar: "BJ",
        verified: true,
      },
      rating: 2,
      title: "Disappointed with battery life",
      content: "The watch looks great and has nice features, but the battery barely lasts a day with normal use. Not what I expected for the price.",
      status: "pending" as const,
      helpful: 8,
      notHelpful: 15,
      replies: 2,
      images: [],
      createdAt: "2024-01-23T16:45:00Z",
      publishedAt: null,
      featured: false,
      reported: true,
    },
    {
      id: "REV004",
      product: {
        id: "prod_4",
        title: "Coffee Maker",
        image: "https://burst.shopifycdn.com/photos/turmeric-bowl-and-wooden-spoon_373x@2x.jpg",
        variant: "Stainless Steel",
      },
      customer: {
        id: "cust_4",
        name: "Alice Brown",
        email: "alice.brown@example.com",
        avatar: "AB",
        verified: true,
      },
      rating: 5,
      title: "Perfect morning coffee",
      content: "Makes excellent coffee every time. Easy to use and clean. The programmable timer is a lifesaver for busy mornings.",
      status: "published" as const,
      helpful: 67,
      notHelpful: 3,
      replies: 5,
      images: ["https://burst.shopifycdn.com/photos/turmeric-bowl-and-wooden-spoon_373x@2x.jpg", "https://burst.shopifycdn.com/photos/flatlay-iron-skillet-with-meat-and-other-food_373x@2x.jpg"],
      createdAt: "2024-01-22T14:20:00Z",
      publishedAt: "2024-01-22T15:00:00Z",
      featured: true,
      reported: false,
    },
    {
      id: "REV005",
      product: {
        id: "prod_5",
        title: "Yoga Mat",
        image: "https://burst.shopifycdn.com/photos/flatlay-iron-skillet-with-meat-and-other-food_373x@2x.jpg",
        variant: "Purple",
      },
      customer: {
        id: "cust_5",
        name: "Charlie Wilson",
        email: "charlie.wilson@example.com",
        avatar: "CW",
        verified: false,
      },
      rating: 3,
      title: "Average quality",
      content: "It's okay for the price. Not as thick as I hoped, but does the job. Good for beginners.",
      status: "rejected" as const,
      helpful: 0,
      notHelpful: 0,
      replies: 0,
      images: [],
      createdAt: "2024-01-21T11:30:00Z",
      publishedAt: null,
      featured: false,
      reported: false,
    },
  ];

  const stats = {
    totalReviews: reviews.length,
    averageRating: reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length,
    pendingReviews: reviews.filter(r => r.status === "pending").length,
    reportedReviews: reviews.filter(r => r.reported).length,
    ratingDistribution: {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    },
  };

  return json({ reviews, stats });
};

type Review = {
  id: string;
  product: {
    id: string;
    title: string;
    image: string;
    variant: string;
  };
  customer: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    verified: boolean;
  };
  rating: number;
  title: string;
  content: string;
  status: "pending" | "published" | "rejected";
  helpful: number;
  notHelpful: number;
  replies: number;
  images: string[];
  createdAt: string;
  publishedAt: string | null;
  featured: boolean;
  reported: boolean;
};

type StatusBadge = {
  tone?: BadgeProps["tone"];
  text: string;
};

export default function ReviewsPage() {
  const { reviews, stats } = useLoaderData<{
    reviews: Review[];
    stats: {
      totalReviews: number;
      averageRating: number;
      pendingReviews: number;
      reportedReviews: number;
      ratingDistribution: {
        5: number;
        4: number;
        3: number;
        2: number;
        1: number;
      };
    };
  }>();

  const navigate = useNavigate();
  const { smUp } = useBreakpoints();

  const [queryValue, setQueryValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [ratingFilter, setRatingFilter] = useState<string[]>([]);
  const [sortValue, setSortValue] = useState("created desc");
  const [selected, setSelected] = useState(0);
  const [moderateModalActive, setModerateModalActive] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyModalActive, setReplyModalActive] = useState(false);

  const resourceName = {
    singular: "review",
    plural: "reviews",
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(reviews);

  // Filter reviews
  const filteredReviews = useMemo(() => {
    let filtered = [...reviews];

    if (queryValue) {
      filtered = filtered.filter(
        (review) =>
          review.title.toLowerCase().includes(queryValue.toLowerCase()) ||
          review.content.toLowerCase().includes(queryValue.toLowerCase()) ||
          review.customer.name.toLowerCase().includes(queryValue.toLowerCase()) ||
          review.product.title.toLowerCase().includes(queryValue.toLowerCase())
      );
    }

    if (statusFilter.length > 0) {
      filtered = filtered.filter((review) =>
        statusFilter.includes(review.status)
      );
    }

    if (ratingFilter.length > 0) {
      filtered = filtered.filter((review) =>
        ratingFilter.includes(review.rating.toString())
      );
    }

    return filtered;
  }, [reviews, queryValue, statusFilter, ratingFilter]);

  // Sort reviews
  const sortedReviews = useMemo(() => {
    const [field, direction] = sortValue.split(" ");

    return [...filteredReviews].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (field) {
        case "rating":
          aValue = a.rating;
          bValue = b.rating;
          break;
        case "helpful":
          aValue = a.helpful;
          bValue = b.helpful;
          break;
        case "created":
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }

      if (direction === "desc") {
        return aValue < bValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });
  }, [filteredReviews, sortValue]);

  const handleFiltersQueryChange = useCallback(
    (value: string) => setQueryValue(value),
    []
  );

  const handleStatusChange = useCallback(
    (value: string[]) => setStatusFilter(value),
    []
  );

  const handleRatingChange = useCallback(
    (value: string[]) => setRatingFilter(value),
    []
  );

  const handleFiltersClearAll = useCallback(() => {
    setQueryValue("");
    setStatusFilter([]);
    setRatingFilter([]);
  }, []);

  const handleSortChange = useCallback((value: string[]) => {
    setSortValue(value[0] || "created desc");
  }, []);

  const handleModerateReview = useCallback((review: Review) => {
    setSelectedReview(review);
    setModerateModalActive(true);
  }, []);

  const toggleModerateModal = useCallback(() => {
    setModerateModalActive(!moderateModalActive);
    if (!moderateModalActive) {
      setSelectedReview(null);
    }
  }, [moderateModalActive]);

  const toggleReplyModal = useCallback(() => {
    setReplyModalActive(!replyModalActive);
  }, [replyModalActive]);

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Render star rating
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Icon
          key={i}
          source={i <= rating ? StarFilledIcon : StarIcon}
          tone={i <= rating ? "warning" : "subdued"}
        />
      );
    }
    return <InlineStack gap="0">{stars}</InlineStack>;
  };

  // Get status badge
  const getStatusBadge = (status: string): StatusBadge => {
    const statusMap = {
      pending: { tone: "warning", text: "Pending Review" },
      published: { tone: "success", text: "Published" },
      rejected: { tone: "critical", text: "Rejected" },
    } satisfies Record<string, StatusBadge>;

    return statusMap[status as keyof typeof statusMap] || { text: status };
  };

  // Calculate rating percentage
  const getRatingPercentage = (count: number) => {
    return stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
  };

  // Filter options
  const filters = [
    {
      key: "status",
      label: "Status",
      filter: (
        <Select
          label="Status"
          options={[
            { label: "All", value: "" },
            { label: "Pending", value: "pending" },
            { label: "Published", value: "published" },
            { label: "Rejected", value: "rejected" },
          ]}
          onChange={(value) => setStatusFilter(value ? [value] : [])}
          value={statusFilter[0] || ""}
        />
      ),
    },
    {
      key: "rating",
      label: "Rating",
      filter: (
        <Select
          label="Rating"
          options={[
            { label: "All ratings", value: "" },
            { label: "5 stars", value: "5" },
            { label: "4 stars", value: "4" },
            { label: "3 stars", value: "3" },
            { label: "2 stars", value: "2" },
            { label: "1 star", value: "1" },
          ]}
          onChange={(value) => setRatingChange(value ? [value] : [])}
          value={ratingFilter[0] || ""}
        />
      ),
    },
  ];

  // Sort options
  const sortOptions = [
    { label: "Newest first", value: "created desc" },
    { label: "Oldest first", value: "created asc" },
    { label: "Highest rating", value: "rating desc" },
    { label: "Lowest rating", value: "rating asc" },
    { label: "Most helpful", value: "helpful desc" },
  ];

  // Bulk actions
  const promotedBulkActions = [
    {
      content: "Approve",
      onAction: () => console.log("Approve:", selectedResources),
    },
    {
      content: "Reject",
      onAction: () => console.log("Reject:", selectedResources),
      destructive: true,
    },
  ];

  const bulkActions = [
    {
      content: "Feature reviews",
      onAction: () => console.log("Feature:", selectedResources),
    },
    {
      content: "Export reviews",
      onAction: () => console.log("Export:", selectedResources),
    },
    {
      content: "Delete reviews",
      onAction: () => console.log("Delete:", selectedResources),
      destructive: true,
    },
  ];

  // Table headers
  const headings: IndexTableProps["headings"] = [
    { title: "Review" },
    { title: "Product" },
    { title: "Customer" },
    { title: "Rating" },
    { title: "Engagement" },
    { title: "Status" },
    { title: "Actions" },
  ];

  // Row markup
  const rowMarkup = sortedReviews.map((review, index) => (
    <IndexTable.Row
      id={review.id}
      key={review.id}
      selected={selectedResources.includes(review.id)}
      position={index}
    >
      <IndexTable.Cell>
        <BlockStack gap="100">
          <Text as="p" variant="bodyMd" fontWeight="semibold">
            {review.title}
          </Text>
          <Text as="p" variant="bodySm" tone="subdued" truncate>
            {review.content}
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            {formatDate(review.createdAt)}
          </Text>
          <InlineStack gap="200">
            {review.featured && (
              <Badge tone="success">Featured</Badge>
            )}
            {review.reported && (
              <Badge tone="critical" icon={FlagIcon}>
                Reported
              </Badge>
            )}
          </InlineStack>
        </BlockStack>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <InlineStack gap="200" blockAlign="center">
          <Thumbnail
            source={review.product.image}
            alt={review.product.title}
            size="small"
          />
          <BlockStack gap="050">
            <Text as="p" variant="bodyMd">
              {review.product.title}
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              {review.product.variant}
            </Text>
          </BlockStack>
        </InlineStack>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <InlineStack gap="200" blockAlign="center">
          <Avatar size="sm" initials={review.customer.avatar} />
          <BlockStack gap="050">
            <InlineStack gap="100" blockAlign="center">
              <Text as="p" variant="bodyMd">
                {review.customer.name}
              </Text>
              {review.customer.verified && (
                <Icon source={CheckCircleIcon} tone="success" />
              )}
            </InlineStack>
            <Text as="p" variant="bodySm" tone="subdued">
              {review.customer.email}
            </Text>
          </BlockStack>
        </InlineStack>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <BlockStack gap="100">
          {renderStars(review.rating)}
          <Text as="p" variant="bodySm">
            {review.rating} out of 5
          </Text>
        </BlockStack>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <BlockStack gap="100">
          <InlineStack gap="200">
            <InlineStack gap="050" blockAlign="center">
              <Icon source={ThumbsUpIcon} tone="success" />
              <Text as="span" variant="bodySm">
                {review.helpful}
              </Text>
            </InlineStack>
            <InlineStack gap="050" blockAlign="center">
              <Icon source={ThumbsDownIcon} tone="critical" />
              <Text as="span" variant="bodySm">
                {review.notHelpful}
              </Text>
            </InlineStack>
          </InlineStack>
          {review.replies > 0 && (
            <Text as="p" variant="bodySm" tone="subdued">
              {review.replies} replies
            </Text>
          )}
        </BlockStack>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <Badge tone={getStatusBadge(review.status).tone}>
          {getStatusBadge(review.status).text}
        </Badge>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <InlineStack gap="100">
          {review.status === "pending" && (
            <Button size="slim" onClick={() => handleModerateReview(review)}>
              Moderate
            </Button>
          )}
          {review.status === "published" && (
            <Button size="slim" onClick={toggleReplyModal}>
              Reply
            </Button>
          )}
          <Button variant="plain" size="slim">
            View
          </Button>
        </InlineStack>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  // Empty state
  const emptyStateMarkup = (
    <EmptyState
      heading="No reviews yet"
      action={{
        content: "Import reviews",
        onAction: () => console.log("Import reviews"),
      }}
      image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
    >
      <p>
        Customer reviews will appear here once they start leaving feedback on
        your products.
      </p>
    </EmptyState>
  );

  return (
    <Page
      title="Customer Reviews"
      primaryAction={{
        content: "Import reviews",
        onAction: () => console.log("Import reviews"),
      }}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="600">
            {/* Stats cards */}
            <InlineGrid columns={{ xs: 1, sm: 2, md: 4 }} gap="400">
              <Card>
                <Box padding="400">
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingMd" tone="subdued">
                      Average Rating
                    </Text>
                    <InlineStack gap="200" blockAlign="center">
                      <Text as="p" variant="heading2xl" fontWeight="bold">
                        {stats.averageRating.toFixed(1)}
                      </Text>
                      {renderStars(Math.round(stats.averageRating))}
                    </InlineStack>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Based on {stats.totalReviews} reviews
                    </Text>
                  </BlockStack>
                </Box>
              </Card>

              <Card>
                <Box padding="400">
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingMd" tone="subdued">
                      Total Reviews
                    </Text>
                    <Text as="p" variant="heading2xl" fontWeight="bold">
                      {stats.totalReviews}
                    </Text>
                    <Text as="p" variant="bodySm" tone="success">
                      +15% from last month
                    </Text>
                  </BlockStack>
                </Box>
              </Card>

              <Card>
                <Box padding="400">
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingMd" tone="subdued">
                      Pending Review
                    </Text>
                    <Text as="p" variant="heading2xl" fontWeight="bold" tone="warning">
                      {stats.pendingReviews}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Needs moderation
                    </Text>
                  </BlockStack>
                </Box>
              </Card>

              <Card>
                <Box padding="400">
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingMd" tone="subdued">
                      Reported
                    </Text>
                    <Text as="p" variant="heading2xl" fontWeight="bold" tone="critical">
                      {stats.reportedReviews}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Requires attention
                    </Text>
                  </BlockStack>
                </Box>
              </Card>
            </InlineGrid>

            {/* Rating distribution */}
            <Card>
              <Box padding="400">
                <BlockStack gap="400">
                  <Text as="h3" variant="headingMd">
                    Rating Distribution
                  </Text>
                  <BlockStack gap="200">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <InlineStack key={rating} gap="300" blockAlign="center">
                        <Box minWidth="100">
                          <InlineStack gap="100" blockAlign="center">
                            <Text as="span" variant="bodyMd">
                              {rating} star{rating !== 1 ? "s" : ""}
                            </Text>
                          </InlineStack>
                        </Box>
                        <Box fill>
                          <ProgressBar
                            progress={getRatingPercentage(stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution])}
                            size="small"
                            tone="emphasis"
                          />
                        </Box>
                        <Box minWidth="50">
                          <Text as="span" variant="bodyMd" alignment="end">
                            {stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution]}
                          </Text>
                        </Box>
                      </InlineStack>
                    ))}
                  </BlockStack>
                </BlockStack>
              </Box>
            </Card>

            {/* Alerts */}
            {stats.pendingReviews > 0 && (
              <Banner tone="warning" icon={AlertCircleIcon}>
                <BlockStack gap="200">
                  <Text as="p" variant="bodyMd" fontWeight="semibold">
                    {stats.pendingReviews} reviews pending moderation
                  </Text>
                  <Text as="p" variant="bodyMd">
                    Review and approve customer reviews to display them on your store.
                  </Text>
                </BlockStack>
              </Banner>
            )}

            {stats.reportedReviews > 0 && (
              <Banner tone="critical" icon={FlagIcon}>
                <BlockStack gap="200">
                  <Text as="p" variant="bodyMd" fontWeight="semibold">
                    {stats.reportedReviews} reviews have been reported
                  </Text>
                  <Text as="p" variant="bodyMd">
                    Review reported content for potential violations of your review guidelines.
                  </Text>
                </BlockStack>
              </Banner>
            )}

            {/* Table */}
            <Card padding="0">
              <IndexFilters
                sortOptions={sortOptions}
                sortSelected={[sortValue]}
                onSortChange={handleSortChange}
                queryValue={queryValue}
                queryPlaceholder="Search reviews"
                onQueryChange={handleFiltersQueryChange}
                onQueryClear={() => setQueryValue("")}
                onClearAll={handleFiltersClearAll}
                filters={filters}
                tabs={[]}
                selected={selected}
                onSelect={setSelected}
                canCreateNewView={false}
                loading={false}
              />

              {sortedReviews.length === 0 && queryValue === "" && statusFilter.length === 0 && ratingFilter.length === 0 ? (
                emptyStateMarkup
              ) : (
                <IndexTable
                  condensed={!smUp}
                  resourceName={resourceName}
                  itemCount={sortedReviews.length}
                  selectedItemsCount={
                    allResourcesSelected ? "All" : selectedResources.length
                  }
                  onSelectionChange={handleSelectionChange}
                  promotedBulkActions={promotedBulkActions}
                  bulkActions={bulkActions}
                  headings={headings}
                  sortable={[false, false, false, true, true, false, false]}
                >
                  {rowMarkup}
                </IndexTable>
              )}
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>

      {/* Moderate Review Modal */}
      <Modal
        open={moderateModalActive}
        onClose={toggleModerateModal}
        title="Moderate review"
        primaryAction={{
          content: "Approve & Publish",
          onAction: toggleModerateModal,
        }}
        secondaryActions={[
          {
            content: "Reject",
            destructive: true,
            onAction: toggleModerateModal,
          },
          {
            content: "Cancel",
            onAction: toggleModerateModal,
          },
        ]}
      >
        {selectedReview && (
          <Modal.Section>
            <BlockStack gap="400">
              <Card>
                <BlockStack gap="300">
                  <InlineStack align="space-between">
                    <Text as="h3" variant="headingMd">
                      Review Details
                    </Text>
                    {renderStars(selectedReview.rating)}
                  </InlineStack>

                  <Divider />

                  <BlockStack gap="200">
                    <Text as="p" variant="bodyMd" fontWeight="semibold">
                      {selectedReview.title}
                    </Text>
                    <Text as="p" variant="bodyMd">
                      {selectedReview.content}
                    </Text>
                  </BlockStack>

                  {selectedReview.images.length > 0 && (
                    <>
                      <Divider />
                      <BlockStack gap="200">
                        <Text as="p" variant="bodyMd" fontWeight="semibold">
                          Attached Images
                        </Text>
                        <InlineStack gap="200">
                          {selectedReview.images.map((image, idx) => (
                            <Thumbnail key={idx} source={image} alt="" size="large" />
                          ))}
                        </InlineStack>
                      </BlockStack>
                    </>
                  )}

                  <Divider />

                  <InlineGrid columns={2} gap="400">
                    <BlockStack gap="100">
                      <Text as="p" variant="bodySm" tone="subdued">
                        Customer
                      </Text>
                      <InlineStack gap="100" blockAlign="center">
                        <Text as="p" variant="bodyMd">
                          {selectedReview.customer.name}
                        </Text>
                        {selectedReview.customer.verified && (
                          <Badge tone="success">Verified</Badge>
                        )}
                      </InlineStack>
                    </BlockStack>
                    <BlockStack gap="100">
                      <Text as="p" variant="bodySm" tone="subdued">
                        Product
                      </Text>
                      <Text as="p" variant="bodyMd">
                        {selectedReview.product.title}
                      </Text>
                    </BlockStack>
                  </InlineGrid>
                </BlockStack>
              </Card>

              <TextField
                label="Admin response (optional)"
                value=""
                onChange={() => {}}
                multiline={3}
                placeholder="Thank you for your review..."
                autoComplete="off"
              />

              <Select
                label="Action"
                options={[
                  { label: "Approve and publish", value: "approve" },
                  { label: "Approve but don't publish", value: "approve_hidden" },
                  { label: "Request changes from customer", value: "request_changes" },
                  { label: "Reject review", value: "reject" },
                ]}
                onChange={() => {}}
                value="approve"
              />
            </BlockStack>
          </Modal.Section>
        )}
      </Modal>

      {/* Reply Modal */}
      <Modal
        open={replyModalActive}
        onClose={toggleReplyModal}
        title="Reply to review"
        primaryAction={{
          content: "Send reply",
          onAction: toggleReplyModal,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: toggleReplyModal,
          },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="400">
            <TextField
              label="Your response"
              value=""
              onChange={() => {}}
              multiline={4}
              placeholder="Thank you for your feedback..."
              autoComplete="off"
            />
            <Banner>
              <Text as="p" variant="bodyMd">
                Your reply will be publicly visible on the product page.
              </Text>
            </Banner>
          </BlockStack>
        </Modal.Section>
      </Modal>
    </Page>
  );
}