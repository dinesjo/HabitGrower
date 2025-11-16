import { Box, Paper, Skeleton, Typography } from "@mui/material";

export function ChartSkeleton() {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 2,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "text.primary" }}>
        <Skeleton width={150} />
      </Typography>

      {/* Graph Controls Skeleton */}
      <Box sx={{ mb: 3, display: "flex", flexDirection: "column", gap: 2, maxWidth: 500, mx: "auto" }}>
        <Box>
          <Skeleton width={80} height={16} sx={{ mb: 1 }} />
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Skeleton variant="rounded" height={38} sx={{ flex: 1, borderRadius: 1.5 }} />
            <Skeleton variant="rounded" height={38} sx={{ flex: 1, borderRadius: 1.5 }} />
            <Skeleton variant="rounded" height={38} sx={{ flex: 1, borderRadius: 1.5 }} />
          </Box>
        </Box>
        <Box>
          <Skeleton width={80} height={16} sx={{ mb: 1 }} />
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Skeleton variant="rounded" height={38} sx={{ flex: 1, borderRadius: 1.5 }} />
            <Skeleton variant="rounded" height={38} sx={{ flex: 1, borderRadius: 1.5 }} />
            <Skeleton variant="rounded" height={38} sx={{ flex: 1, borderRadius: 1.5 }} />
          </Box>
        </Box>
      </Box>

      {/* Chart Skeleton */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          gap: 1,
          height: 220,
          px: 2,
        }}
      >
        {[40, 65, 30, 80, 50, 70, 45, 90, 35, 60].map((height, index) => (
          <Skeleton
            key={index}
            variant="rectangular"
            sx={{
              flex: 1,
              maxWidth: 40,
              height: `${height}%`,
              borderRadius: 1,
            }}
          />
        ))}
      </Box>

      {/* Stats Skeleton */}
      <Box sx={{ mt: 3, pt: 3, borderTop: "1px solid", borderColor: "divider" }}>
        <Box sx={{ display: "flex", gap: 2 }}>
          {[1, 2, 3].map((i) => (
            <Box
              key={i}
              sx={{
                flex: 1,
                textAlign: "center",
                p: 2,
                borderRadius: 2,
                bgcolor: "action.hover",
              }}
            >
              <Skeleton variant="circular" width={28} height={28} sx={{ mx: "auto", mb: 0.5 }} />
              <Skeleton width={40} height={32} sx={{ mx: "auto", mb: 0.5 }} />
              <Skeleton width={60} height={16} sx={{ mx: "auto" }} />
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}

export function HeatmapSkeleton() {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 2,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "text.primary" }}>
        <Skeleton width={160} />
      </Typography>

      <Box sx={{ display: "flex", gap: 1, overflowX: "hidden" }}>
        {/* Day labels */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", pt: 2 }}>
          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
            <Skeleton key={day} width={30} height={12} />
          ))}
        </Box>

        {/* Heatmap grid */}
        <Box sx={{ display: "flex", gap: "2px", flex: 1 }}>
          {Array.from({ length: 13 }, (_, weekIdx) => (
            <Box key={weekIdx} sx={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
              <Skeleton width="100%" height={12} sx={{ mb: "2px" }} />
              {Array.from({ length: 7 }, (_, dayIdx) => (
                <Skeleton
                  key={dayIdx}
                  variant="rounded"
                  width="100%"
                  height={12}
                  sx={{ borderRadius: 0.5 }}
                />
              ))}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Legend */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2, justifyContent: "flex-end" }}>
        <Skeleton width={30} height={12} />
        {[1, 2].map((level) => (
          <Skeleton key={level} variant="rounded" width={12} height={12} sx={{ borderRadius: 0.5 }} />
        ))}
        <Skeleton width={30} height={12} />
      </Box>
    </Paper>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 2,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: "text.primary" }}>
          <Skeleton width={180} />
        </Typography>
        <Skeleton width={120} height={36} sx={{ borderRadius: 1 }} />
      </Box>

      {Array.from({ length: count }, (_, index) => (
        <Box
          key={index}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 1.5,
            mb: 0.5,
            borderRadius: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Skeleton width="60%" height={20} sx={{ mb: 0.5 }} />
            <Skeleton width="40%" height={16} />
          </Box>
          <Skeleton variant="circular" width={40} height={40} />
        </Box>
      ))}
    </Paper>
  );
}

export function HabitCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <Paper
          key={index}
          elevation={0}
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Avatar with progress ring skeleton */}
            <Box sx={{ position: "relative" }}>
              <Skeleton variant="circular" width={56} height={56} />
              <Skeleton
                variant="circular"
                width={48}
                height={48}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              />
            </Box>

            {/* Text content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Skeleton width="70%" height={24} sx={{ mb: 0.5 }} />
              <Skeleton width="50%" height={16} />
            </Box>

            {/* Progress indicator */}
            <Box sx={{ textAlign: "right" }}>
              <Skeleton width={60} height={32} sx={{ mb: 0.5 }} />
              <Skeleton width={80} height={16} />
            </Box>
          </Box>
        </Paper>
      ))}
    </>
  );
}
