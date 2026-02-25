# Plan: Fetch Top 5 Doctors for Expert Carousel

The home page already has an `ExpertsCarousel` component displaying hardcoded mock data. This plan replaces it with real doctor data from the database, fetching the top 5 doctors by rating with their profile picture, name, and specialty.

**Key Decision**: Use existing carousel UI but replace data source with a new tRPC procedure that fetches approved doctors sorted by `avgRating` (descending), limited to 5 results.

## Steps

### 1. Create tRPC procedure for fetching top experts
- Add new router file `apps/vyan-client/src/server/api/routers/getTopExperts.ts`
- Query `ProfessionalUser` table with filters: `isapproved: true` and `deletedAt: null`
- Sort by `avgRating` descending, limit to 5
- Select only: `id`, `firstName`, `lastName`, `userName`, `media.fileUrl`, `displayQualification.specialization`
- Use Prisma pattern from existing routers (e.g., `findDoctorsbasedonFilters.ts` line 319)

### 2. Register router in the tRPC root
- Open `apps/vyan-client/src/server/api/root.ts`
- Import `getTopExperts` router
- Add to `appRouter` as `topExperts: getTopExperts`

### 3. Update ExpertsCarousel component to fetch and display real data
- Open `apps/vyan-client/src/components/experts-carousel.tsx`
- Import tRPC client: `api` from `~/trpc/react`
- Replace `EXPERTS_DATA` with `api.topExperts.getTopExperts.useQuery()`
- Transform the query result to match carousel's data structure:
  ```typescript
  {
    id: doctor.id,
    name: `${doctor.firstName} ${doctor.lastName}`,
    role: doctor.displayQualification?.specialization ?? "Specialist",
    image: doctor.media?.fileUrl ?? "/images/fallback-user-profile.png",
    userName: doctor.userName
  }
  ```
- Handle loading state (show skeleton or keep mock data until loaded)
- Handle error state (fallback to message or empty state)
- Update image `src` at line ~163 to use `expert.image`
- Update role badge at line ~180 to use `expert.role`
- Optionally: Add doctor name display (currently not shown, consider adding below role badge for center item)
- Optionally: Make carousel items clickable linking to `/counselling/${expert.userName}`

### 4. Verify data safety
- Ensure fallback image path `/images/fallback-user-profile.png` exists in `apps/vyan-client/public/images/`
- Handle cases where `displayQualification` is null (fallback to "Specialist")
- Handle empty result set (show message )

## Verification

- Run dev server: `pnpm dev` from workspace root
- Navigate to home page (`/`)
- Confirm ExpertsCarousel displays 5 real doctors with profile pictures
- Verify specialization labels appear correctly (not just "Specialist")
- Check fallback image appears for doctors without profile pictures
- Test carousel navigation (prev/next buttons, auto-scroll)
- Verify no console errors related to data fetching
- Inspect Network tab to confirm tRPC query executes successfully

## Decisions

- **Limit: 5 doctors** (user preference) - sufficient for carousel display without overcrowding
- **Sorting: By avgRating DESC** (user preference) - showcases highest-rated experts
- **Display fields: pic, name, specialty** (user requirement) - minimal data for performance
- **Layout: Horizontal carousel** (existing implementation) - maintains current UX
- **Add name display**: Consider showing full name on hover or below role for center item (enhancement)

## Technical Context

### Database Schema (ProfessionalUser)
```
- id: String (CUID)
- firstName, lastName: String
- userName: String (unique)
- avgRating: Decimal
- isapproved: Boolean (default: false)
- deletedAt: DateTime (nullable)
- media: { fileUrl: String }
- displayQualification: { specialization: String }
```

### Existing tRPC Pattern
```typescript
// Filter pattern from findDoctorsbasedonFilters.ts
whereCondition = { 
  AND: [
    whereCondition, 
    { isapproved: true },
    { deletedAt: null }
  ] 
}
```

### Current Component Location
- Home page: `apps/vyan-client/src/app/page.tsx` (line 82)
- Experts carousel: `apps/vyan-client/src/components/experts-carousel.tsx`
- Current implementation uses hardcoded `EXPERTS_DATA` array with mock images
