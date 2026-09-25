/* eslint-disable react-hooks/set-state-in-effect */
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  CircleOff,
  Clock3,
  Edit3,
  Eye,
  FileText,
  IndianRupee,
  LayoutDashboard,
  ListChecks,
  LogOut,
  MapPin,
  Menu,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Settings,
  ShieldCheck,
  Trash2,
  User,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useApp } from "../context/AppContext";

import {
  confirmAction,
  showError,
  showSuccess,
  showWarning,
  toast,
} from "../lib/swal";

import {
  panditApi,
  PanditApiError,
  type PanditProfile,
  type PanditProfileInput,
  type PanditService,
  type PanditServiceInput,
} from "../lib/panditApi";

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type TabId =
  | "overview"
  | "profile"
  | "services"
  | "verification";

type LoadingState = {
  page: boolean;
  savingProfile: boolean;
  savingService: boolean;
};

type ArrayField =
  | "languages"
  | "specializations"
  | "pujaTypes"
  | "serviceAreas";

/*
|--------------------------------------------------------------------------
| Initial State Helpers
|--------------------------------------------------------------------------
*/

function createEmptyProfile(): PanditProfileInput {
  return {
    name: "",
    phone: "",
    city: "",
    district: "",
    state: "",
    country: "India",
    displayName: "",
    title: "",
    photo: "",
    experienceYears: 0,
    location: "",
    languages: [],
    specializations: [],
    pujaTypes: [],
    associatedWith: "",
    about: "",
    availability: "",
    serviceAreas: [],
  };
}

function createEmptyService(): PanditServiceInput {
  return {
    name: "",
    description: "",
    priceAmount: null,
    currency: "INR",
    durationMinutes: null,
    isActive: true,
  };
}

/*
|--------------------------------------------------------------------------
| Utility Functions
|--------------------------------------------------------------------------
*/

function csvToArray(
  value: string,
): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .filter(
      (item, index, all) =>
        all.indexOf(item) === index,
    );
}

function arrayToCsv(
  value: string[] | undefined,
): string {
  return (value ?? []).join(", ");
}

function statusClass(
  status: string,
): string {
  const normalized =
    status.trim().toLowerCase();

  if (
    normalized === "approved" ||
    normalized === "verified" ||
    normalized === "active"
  ) {
    return "bg-emerald-100 text-emerald-800";
  }

  if (
    normalized === "rejected" ||
    normalized === "suspended" ||
    normalized === "blocked"
  ) {
    return "bg-rose-100 text-rose-800";
  }

  return "bg-amber-100 text-amber-900";
}

function displayCurrency(
  amount: number | null,
  currency: string,
): string {
  if (
    amount === null ||
    amount === undefined
  ) {
    return "Price on request";
  }

  try {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency:
          currency || "INR",
        maximumFractionDigits: 2,
      },
    ).format(amount);
  } catch {
    return `${currency || "INR"} ${amount}`;
  }
}

function calculateStats(
  services: PanditService[],
) {
  const activeServices =
    services.filter(
      (service) => service.isActive,
    ).length;

  return {
    totalServices: services.length,
    activeServices,
    inactiveServices:
      services.length -
      activeServices,
  };
}

function isValidPhotoUrl(
  value: string,
): boolean {
  const trimmed = value.trim();

  if (!trimmed) {
    return true;
  }

  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("./")
  ) {
    return true;
  }

  try {
    const url = new URL(trimmed);

    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
}

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function PanditDashboard() {
  const {
    user,
    logout,
    refreshUser,
  } = useApp();

  const navigate = useNavigate();

  const [tab, setTab] =
    useState<TabId>("overview");

  const [
    mobileNavOpen,
    setMobileNavOpen,
  ] = useState(false);

  const [
    profile,
    setProfile,
  ] = useState<PanditProfile | null>(
    null,
  );

  const [
    profileMissing,
    setProfileMissing,
  ] = useState(false);

  const [
    pageError,
    setPageError,
  ] = useState<string | null>(
    null,
  );

  const [
    services,
    setServices,
  ] = useState<PanditService[]>(
    [],
  );

  const [
    stats,
    setStats,
  ] = useState({
    totalServices: 0,
    activeServices: 0,
    inactiveServices: 0,
  });

  const [
    loading,
    setLoading,
  ] = useState<LoadingState>({
    page: true,
    savingProfile: false,
    savingService: false,
  });

  const [
    profileForm,
    setProfileForm,
  ] = useState<PanditProfileInput>(
    createEmptyProfile(),
  );

  const [
    serviceForm,
    setServiceForm,
  ] = useState<PanditServiceInput>(
    createEmptyService(),
  );

  const [
    editingServiceId,
    setEditingServiceId,
  ] = useState<number | null>(
    null,
  );

  const [
    serviceModalOpen,
    setServiceModalOpen,
  ] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Styling
  |--------------------------------------------------------------------------
  */

  const formInput =
    "w-full rounded-xl border border-orange-900/10 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200 disabled:cursor-not-allowed disabled:bg-stone-100";

  /*
  |--------------------------------------------------------------------------
  | Profile Form Helpers
  |--------------------------------------------------------------------------
  */

  const fillProfileFormFromProfile = useCallback(
    (
      nextProfile: PanditProfile,
    ) => {
      setProfileForm({
        name: user?.name ?? "",
        phone: user?.phone ?? "",
        city:
          user?.city ??
          nextProfile.city ??
          "",
        district:
          nextProfile.district ?? "",
        state:
          user?.state ??
          nextProfile.state ??
          "",
        country:
          user?.country ??
          nextProfile.country ??
          "India",
        displayName:
          nextProfile.displayName,
        title:
          nextProfile.title ?? "",
        photo:
          nextProfile.photo ?? "",
        experienceYears:
          nextProfile.experienceYears,
        location:
          nextProfile.location ?? "",
        languages:
          nextProfile.languages ?? [],
        specializations:
          nextProfile.specializations ??
          [],
        pujaTypes:
          nextProfile.pujaTypes ?? [],
        associatedWith:
          nextProfile.associatedWith ??
          "",
        about:
          nextProfile.about ?? "",
        availability:
          nextProfile.availability ??
          "",
        serviceAreas:
          nextProfile.serviceAreas ?? [],
      });
    },
    [
      user?.city,
      user?.country,
      user?.name,
      user?.phone,
      user?.state,
    ],
  );

  const resetProfileForm = useCallback(
    () => {
      if (profile) {
        fillProfileFormFromProfile(
          profile,
        );
        return;
      }

      setProfileForm({
        ...createEmptyProfile(),
        name:
          user?.name ?? "",
        phone:
          user?.phone ?? "",
        city:
          user?.city ?? "",
        state:
          user?.state ?? "",
        country:
          user?.country ?? "India",
        displayName:
          user?.name ?? "",
      });
    },
    [
      fillProfileFormFromProfile,
      profile,
      user?.city,
      user?.country,
      user?.name,
      user?.phone,
      user?.state,
    ],
  );

  /*
  |--------------------------------------------------------------------------
  | Load Dashboard
  |--------------------------------------------------------------------------
  */

  const loadDashboard =
    useCallback(async () => {
      setLoading(
        (current) => ({
          ...current,
          page: true,
        }),
      );

      setPageError(null);

      try {
        const response =
          await panditApi.dashboard();

        setProfile(
          response.profile,
        );

        setProfileMissing(false);

        setServices(
          response.services ?? [],
        );

        setStats(
          response.stats ??
            calculateStats(
              response.services ??
                [],
            ),
        );

        fillProfileFormFromProfile(
          response.profile,
        );
      } catch (error) {
        if (
          error instanceof PanditApiError &&
          (
            error.status === 404 ||
            error.code ===
              "PANDIT_PROFILE_NOT_FOUND"
          )
        ) {
          setProfile(null);
          setServices([]);
          setStats({
            totalServices: 0,
            activeServices: 0,
            inactiveServices: 0,
          });

          setProfileMissing(true);
          setTab("profile");

          setProfileForm({
            ...createEmptyProfile(),
            name:
              user?.name ?? "",
            phone:
              user?.phone ?? "",
            city:
              user?.city ?? "",
            state:
              user?.state ?? "",
            country:
              user?.country ?? "India",
            displayName:
              user?.name ?? "",
          });

          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Please try again.";

        setPageError(message);
      } finally {
        setLoading(
          (current) => ({
            ...current,
            page: false,
          }),
        );
      }
    }, [
      fillProfileFormFromProfile,
      user?.city,
      user?.country,
      user?.name,
      user?.phone,
      user?.state,
    ]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  /*
  |--------------------------------------------------------------------------
  | Derived Data
  |--------------------------------------------------------------------------
  */

  const activeServices =
    useMemo(
      () =>
        services.filter(
          (service) =>
            service.isActive,
        ),
      [services],
    );

  const profileCompleteness =
    useMemo(() => {
      const values = [
        profile?.displayName ??
          profileForm.displayName,
        profile?.title ??
          profileForm.title,
        profile?.about ??
          profileForm.about,
        profile?.city ??
          profileForm.city,
        profile?.state ??
          profileForm.state,
        profile?.photo ??
          profileForm.photo,
        (
          profile?.languages ??
          profileForm.languages ??
          []
        ).length
          ? "yes"
          : "",
        (
          profile?.specializations ??
          profileForm.specializations ??
          []
        ).length
          ? "yes"
          : "",
        (
          profile?.pujaTypes ??
          profileForm.pujaTypes ??
          []
        ).length
          ? "yes"
          : "",
        (
          profile?.serviceAreas ??
          profileForm.serviceAreas ??
          []
        ).length
          ? "yes"
          : "",
      ];

      const completed =
        values.filter(Boolean)
          .length;

      return Math.round(
        (completed /
          values.length) *
          100,
      );
    }, [
      profile,
      profileForm,
    ]);

  /*
  |--------------------------------------------------------------------------
  | Services Modal
  |--------------------------------------------------------------------------
  */

  const closeServiceModal =
    useCallback(() => {
      setServiceModalOpen(
        false,
      );
      setEditingServiceId(null);
      setServiceForm(
        createEmptyService(),
      );
    }, []);

  const openCreateService =
    useCallback(() => {
      setEditingServiceId(null);
      setServiceForm(
        createEmptyService(),
      );
      setServiceModalOpen(true);
    }, []);

  const openEditService =
    useCallback(
      (
        service: PanditService,
      ) => {
        setEditingServiceId(
          service.id,
        );

        setServiceForm({
          name: service.name,
          description:
            service.description ??
            "",
          priceAmount:
            service.priceAmount,
          currency:
            service.currency || "INR",
          durationMinutes:
            service.durationMinutes,
          isActive:
            service.isActive,
        });

        setServiceModalOpen(true);
      },
      [],
    );

  /*
  |--------------------------------------------------------------------------
  | Save / Create Profile
  |--------------------------------------------------------------------------
  */

  const saveProfile =
    useCallback(async () => {
      const displayName =
        profileForm.displayName
          ?.trim() ?? "";

      if (displayName.length < 2) {
        toast(
          "warning",
          "Display name must contain at least 2 characters.",
        );
        return;
      }

      const experienceYears =
        Number(
          profileForm.experienceYears ??
            0,
        );

      if (
        !Number.isFinite(
          experienceYears,
        ) ||
        experienceYears < 0 ||
        experienceYears > 100
      ) {
        toast(
          "warning",
          "Experience must be between 0 and 100 years.",
        );
        return;
      }

      const photo =
        profileForm.photo?.trim() ??
        "";

      if (!isValidPhotoUrl(photo)) {
        toast(
          "warning",
          "Please enter a valid HTTP(S) photo URL or relative path.",
        );
        return;
      }

      setLoading(
        (current) => ({
          ...current,
          savingProfile: true,
        }),
      );

      try {
        const payload: PanditProfileInput =
          {
            name:
              profileForm.name
                ?.trim() || undefined,
            phone:
              profileForm.phone
                ?.trim() || undefined,
            city:
              profileForm.city
                ?.trim() || undefined,
            district:
              profileForm.district
                ?.trim() || undefined,
            state:
              profileForm.state
                ?.trim() || undefined,
            country:
              profileForm.country
                ?.trim() || "India",
            displayName,
            title:
              profileForm.title
                ?.trim() || undefined,
            photo:
              photo || undefined,
            experienceYears: Math.floor(
              experienceYears,
            ),
            location:
              profileForm.location
                ?.trim() || undefined,
            languages:
              profileForm.languages ??
              [],
            specializations:
              profileForm.specializations ??
              [],
            pujaTypes:
              profileForm.pujaTypes ??
              [],
            associatedWith:
              profileForm.associatedWith
                ?.trim() || undefined,
            about:
              profileForm.about
                ?.trim() || undefined,
            availability:
              profileForm.availability
                ?.trim() || undefined,
            serviceAreas:
              profileForm.serviceAreas ??
              [],
          };

        const response =
          profileMissing || !profile
            ? await panditApi.createProfile(
                payload,
              )
            : await panditApi.updateProfile(
                payload,
              );

        setProfile(
          response.profile,
        );

        setProfileMissing(false);

        setProfileForm(
          (current) => ({
            ...current,
            displayName:
              response.profile
                .displayName,
            title:
              response.profile.title ??
              "",
            photo:
              response.profile.photo ??
              "",
            experienceYears:
              response.profile
                .experienceYears,
            location:
              response.profile.location ??
              "",
            district:
              response.profile.district ??
              current.district ??
              "",
            city:
              response.profile.city ??
              current.city ??
              "",
            state:
              response.profile.state ??
              current.state ??
              "",
            country:
              response.profile.country ??
              current.country ??
              "India",
            languages:
              response.profile
                .languages ?? [],
            specializations:
              response.profile
                .specializations ?? [],
            pujaTypes:
              response.profile
                .pujaTypes ?? [],
            associatedWith:
              response.profile
                .associatedWith ??
              "",
            about:
              response.profile.about ??
              "",
            availability:
              response.profile
                .availability ?? "",
            serviceAreas:
              response.profile
                .serviceAreas ?? [],
          }),
        );

        try {
          await refreshUser();
        } catch (syncError) {
          console.warn(
            "Unable to refresh authenticated user after Pandit profile save:",
            syncError,
          );
        }

        await showSuccess(
          profileMissing || !profile
            ? "Profile created"
            : "Profile updated",
          profileMissing || !profile
            ? "Your Pandit profile has been created and submitted for Admin review."
            : "Your Pandit profile has been saved successfully.",
        );
      } catch (error) {
        await showError(
          profileMissing || !profile
            ? "Profile creation failed"
            : "Profile update failed",
          error instanceof Error
            ? error.message
            : "Please try again.",
        );
      } finally {
        setLoading(
          (current) => ({
            ...current,
            savingProfile: false,
          }),
        );
      }
    }, [
      profile,
      profileForm,
      profileMissing,
      refreshUser,
    ]);

  /*
  |--------------------------------------------------------------------------
  | Save Service
  |--------------------------------------------------------------------------
  */

  const saveService =
    useCallback(async () => {
      const name =
        serviceForm.name.trim();

      if (name.length < 2) {
        toast(
          "warning",
          "Puja/service name must contain at least 2 characters.",
        );
        return;
      }

      const currency = (
        serviceForm.currency ??
        "INR"
      )
        .trim()
        .toUpperCase();

      if (!/^[A-Z]{3}$/.test(currency)) {
        toast(
          "warning",
          "Currency must be a valid 3-letter code such as INR.",
        );
        return;
      }

      const priceAmount =
        serviceForm.priceAmount;

      if (
        priceAmount !== null &&
        priceAmount !== undefined &&
        (
          !Number.isFinite(
            Number(priceAmount),
          ) ||
          Number(priceAmount) < 0
        )
      ) {
        toast(
          "warning",
          "Price must be a valid non-negative number.",
        );
        return;
      }

      const durationMinutes =
        serviceForm.durationMinutes;

      if (
        durationMinutes !== null &&
        durationMinutes !== undefined &&
        (
          !Number.isInteger(
            Number(
              durationMinutes,
            ),
          ) ||
          Number(durationMinutes) < 1 ||
          Number(durationMinutes) > 1440
        )
      ) {
        toast(
          "warning",
          "Duration must be between 1 and 1440 minutes.",
        );
        return;
      }

      setLoading(
        (current) => ({
          ...current,
          savingService: true,
        }),
      );

      try {
        const payload: PanditServiceInput =
          {
            name,
            description:
              serviceForm.description
                ?.trim() || undefined,
            priceAmount:
              priceAmount ===
                null ||
              priceAmount ===
                undefined
                ? null
                : Number(priceAmount),
            currency,
            durationMinutes:
              durationMinutes ===
                null ||
              durationMinutes ===
                undefined
                ? null
                : Math.floor(
                    Number(
                      durationMinutes,
                    ),
                  ),
            isActive:
              serviceForm.isActive !==
              false,
          };

        if (
          editingServiceId !==
          null
        ) {
          const response =
            await panditApi.updateService(
              editingServiceId,
              payload,
            );

          setServices(
            (current) => {
              const next =
                current.map(
                  (item) =>
                    item.id ===
                    response
                      .service
                      .id
                      ? response.service
                      : item,
                );

              setStats(
                calculateStats(next),
              );

              return next;
            },
          );

          await showSuccess(
            "Service updated",
            "Your Puja/service offering has been updated successfully.",
          );
        } else {
          const response =
            await panditApi.createService(
              payload,
            );

          setServices(
            (current) => {
              const next = [
                response.service,
                ...current,
              ];

              setStats(
                calculateStats(next),
              );

              return next;
            },
          );

          await showSuccess(
            "Service created",
            "Your new Puja/service offering has been added successfully.",
          );
        }

        closeServiceModal();
      } catch (error) {
        await showError(
          editingServiceId !== null
            ? "Service update failed"
            : "Service creation failed",
          error instanceof Error
            ? error.message
            : "Please try again.",
        );
      } finally {
        setLoading(
          (current) => ({
            ...current,
            savingService: false,
          }),
        );
      }
    }, [
      closeServiceModal,
      editingServiceId,
      serviceForm,
    ]);

  /*
  |--------------------------------------------------------------------------
  | Delete Service
  |--------------------------------------------------------------------------
  */

  const deleteService =
    useCallback(
      async (
        service: PanditService,
      ) => {
        const confirmed =
          await confirmAction(
            "Delete this Puja service?",
            `${service.name} will be permanently removed from your service list.`,
            "Yes, delete it",
          );

        if (!confirmed) {
          return;
        }

        try {
          await panditApi.deleteService(
            service.id,
          );

          setServices(
            (current) => {
              const next =
                current.filter(
                  (item) =>
                    item.id !==
                    service.id,
                );

              setStats(
                calculateStats(next),
              );

              return next;
            },
          );

          if (
            editingServiceId ===
            service.id
          ) {
            closeServiceModal();
          }

          await showSuccess(
            "Service deleted",
            "The Puja/service offering has been removed.",
          );
        } catch (error) {
          await showError(
            "Delete failed",
            error instanceof Error
              ? error.message
              : "Please try again.",
          );
        }
      },
      [
        closeServiceModal,
        editingServiceId,
      ],
    );

  /*
  |--------------------------------------------------------------------------
  | Toggle Service
  |--------------------------------------------------------------------------
  */

  const toggleService =
    useCallback(
      async (
        service: PanditService,
      ) => {
        const nextValue =
          !service.isActive;

        const confirmed =
          await confirmAction(
            nextValue
              ? "Activate this Puja service?"
              : "Deactivate this Puja service?",
            nextValue
              ? `${service.name} will become an active offering.`
              : `${service.name} will be hidden from your active offerings.`,
            nextValue
              ? "Activate service"
              : "Deactivate service",
          );

        if (!confirmed) {
          return;
        }

        try {
          const response =
            await panditApi.updateService(
              service.id,
              {
                isActive: nextValue,
              },
            );

          setServices(
            (current) => {
              const next =
                current.map(
                  (item) =>
                    item.id ===
                    service.id
                      ? response.service
                      : item,
                );

              setStats(
                calculateStats(next),
              );

              return next;
            },
          );

          toast(
            "success",
            response.service
              .isActive
              ? "Service activated successfully."
              : "Service deactivated successfully.",
          );
        } catch (error) {
          await showError(
            "Service status update failed",
            error instanceof Error
              ? error.message
              : "Please try again.",
          );
        }
      },
      [],
    );

  /*
  |--------------------------------------------------------------------------
  | Toggle Listing
  |--------------------------------------------------------------------------
  */

  const toggleListing =
    useCallback(async () => {
      if (!profile) {
        return;
      }

      const nextValue =
        !profile.listingActive;

      const confirmed =
        await confirmAction(
          nextValue
            ? "Activate your public listing?"
            : "Deactivate your public listing?",
          nextValue
            ? "Your approved Pandit profile will be made visible wherever active listings are supported."
            : "Visitors will no longer see your profile as an active listing.",
          nextValue
            ? "Activate listing"
            : "Deactivate listing",
        );

      if (!confirmed) {
        return;
      }

      try {
        const response =
          await panditApi.setListing(
            nextValue,
          );

        setProfile(
          (current) =>
            current
              ? {
                  ...current,
                  listingActive:
                    response.listingActive,
                }
              : current,
        );

        await showSuccess(
          response.listingActive
            ? "Listing activated"
            : "Listing deactivated",
          response.listingActive
            ? "Your Pandit listing is active."
            : "Your Pandit listing is now hidden.",
        );
      } catch (error) {
        await showWarning(
          "Listing update blocked",
          error instanceof Error
            ? error.message
            : "Your listing could not be updated.",
        );
      }
    }, [profile]);

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  const handleLogout =
    useCallback(async () => {
      const confirmed =
        await confirmAction(
          "Logout from Pandit dashboard?",
          "Your active browser session will be closed.",
          "Logout",
        );

      if (!confirmed) {
        return;
      }

      try {
        await logout();
        navigate("/", {
          replace: true,
        });
      } catch (error) {
        await showError(
          "Logout failed",
          error instanceof Error
            ? error.message
            : "Please try again.",
        );
      }
    }, [
      logout,
      navigate,
    ]);

  /*
  |--------------------------------------------------------------------------
  | Navigation
  |--------------------------------------------------------------------------
  */

  const navItems: Array<{
    id: TabId;
    label: string;
    icon: typeof LayoutDashboard;
  }> = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      id: "profile",
      label: profileMissing
        ? "Create Profile"
        : "My Profile",
      icon: User,
    },
    {
      id: "services",
      label: "Puja Services",
      icon: ListChecks,
    },
    {
      id: "verification",
      label: "Verification",
      icon: ShieldCheck,
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | Loading Screen
  |--------------------------------------------------------------------------
  */

  if (loading.page) {
    return (
      <div className="min-h-screen bg-[#f7f2ea] p-6 md:p-10">
        <div className="mx-auto flex min-h-[80vh] max-w-6xl items-center justify-center">
          <div className="rounded-3xl border border-orange-900/10 bg-white px-8 py-10 text-center shadow-sm">
            <RefreshCw
              className="mx-auto animate-spin text-orange-700"
              size={28}
            />

            <p className="mt-4 font-semibold text-stone-800">
              Loading Pandit dashboard…
            </p>
          </div>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Page Load Error
  |--------------------------------------------------------------------------
  */

  if (pageError) {
    return (
      <div className="min-h-screen bg-[#f7f2ea] p-6 md:p-10">
        <div className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center">
          <div className="w-full rounded-3xl border border-rose-100 bg-white p-8 text-center shadow-sm">
            <AlertCircle
              className="mx-auto text-rose-600"
              size={38}
            />

            <h1 className="mt-4 text-2xl font-black text-stone-900">
              Unable to load dashboard
            </h1>

            <p className="mt-2 text-sm leading-6 text-stone-600">
              {pageError}
            </p>

            <button
              type="button"
              onClick={() =>
                void loadDashboard()
              }
              className="btn-saffron mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Main Dashboard
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-[#f7f2ea] text-stone-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#2a1a10] text-white shadow-lg">
        <div className="mx-auto flex min-h-16 max-w-[1500px] items-center justify-between gap-4 px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setMobileNavOpen(
                  (current) =>
                    !current,
                )
              }
              className="rounded-xl border border-white/10 p-2 text-orange-100 md:hidden"
              aria-label="Open Pandit navigation"
            >
              {mobileNavOpen ? (
                <X size={19} />
              ) : (
                <Menu size={19} />
              )}
            </button>

            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-600 shadow-inner">
              <BookOpen size={19} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-black tracking-wide">
                DivyaDhara
              </p>

              <p className="truncate text-[9px] font-bold uppercase tracking-[0.22em] text-orange-300">
                Pandit Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                void loadDashboard()
              }
              className="rounded-xl border border-white/10 p-2 text-orange-100 transition hover:bg-white/10"
              title="Refresh dashboard"
            >
              <RefreshCw size={16} />
            </button>

            <div className="hidden min-w-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 sm:block">
              <p className="truncate text-xs font-bold">
                {user?.name ||
                  profile?.displayName ||
                  "Pandit"}
              </p>

              <p className="truncate text-[10px] text-orange-200/70">
                {user?.email}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void handleLogout()
              }
              className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-orange-100 transition hover:bg-white/10"
            >
              <LogOut size={14} />

              <span className="hidden sm:inline">
                Logout
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Layout */}
      <div className="mx-auto grid max-w-[1500px] md:grid-cols-[245px_1fr]">
        {/* Sidebar */}
        <aside
          className={[
            "border-r border-orange-900/10 bg-[#f2eadf] p-4 md:min-h-[calc(100vh-64px)] md:block",
            mobileNavOpen
              ? "block"
              : "hidden",
          ].join(" ")}
        >
          <div className="rounded-3xl bg-gradient-to-br from-[#2a1a10] via-orange-900 to-orange-700 p-5 text-white shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-200">
              Pandit Command Center
            </p>

            <h2 className="mt-2 text-xl font-bold">
              Jai Shri Ram 🙏
            </h2>

            <p className="mt-2 text-xs leading-5 text-orange-100/80">
              Manage your profile, sacred services and listing status from one place.
            </p>
          </div>

          <nav
            className="mt-5 space-y-1.5"
            aria-label="Pandit dashboard"
          >
            {navItems.map(
              (item) => {
                const Icon =
                  item.icon;

                const active =
                  tab === item.id;

                const disabled =
                  profileMissing &&
                  item.id !==
                    "profile";

                return (
                  <button
                    key={
                      item.id
                    }
                    type="button"
                    disabled={
                      disabled
                    }
                    onClick={() => {
                      if (
                        disabled
                      ) {
                        return;
                      }

                      setTab(
                        item.id,
                      );

                      setMobileNavOpen(
                        false,
                      );
                    }}
                    className={[
                      "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition",
                      active
                        ? "bg-[#2a1a10] text-orange-200 shadow"
                        : "text-stone-700 hover:bg-white",
                      disabled
                        ? "cursor-not-allowed opacity-40"
                        : "",
                    ].join(" ")}
                  >
                    <Icon size={17} />

                    {item.label}
                  </button>
                );
              },
            )}
          </nav>

          <div className="mt-6 rounded-2xl border border-orange-900/10 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-stone-600">
                Profile completeness
              </span>

              <span className="text-sm font-black text-orange-800">
                {profileCompleteness}%
              </span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-orange-100">
              <div
                className="h-full rounded-full bg-orange-600 transition-all"
                style={{
                  width: `${profileCompleteness}%`,
                }}
              />
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-[1200px]">

            {/* =========================================================
                OVERVIEW
            ========================================================== */}

            {tab === "overview" && (
              <>
                {!profile ? (
                  <section className="rounded-[2rem] border border-orange-900/10 bg-white p-8 text-center shadow-sm">
                    <AlertCircle
                      className="mx-auto text-orange-700"
                      size={40}
                    />

                    <h1 className="mt-4 text-2xl font-black">
                      Complete your Pandit profile
                    </h1>

                    <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-stone-600">
                      Your Pandit account is active, but the professional profile has not been created yet.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setTab(
                          "profile",
                        )
                      }
                      className="btn-saffron mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-black text-white"
                    >
                      <User
                        size={16}
                      />
                      Create Pandit Profile
                    </button>
                  </section>
                ) : (
                  <div className="space-y-6">
                    <section className="rounded-[2rem] bg-gradient-to-br from-[#2a1a10] via-orange-900 to-orange-700 p-6 text-white shadow-lg md:p-8">
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="min-w-0">
                          <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-200">
                            Pandit Workspace
                          </p>

                          <h1 className="mt-2 text-3xl font-black md:text-4xl">
                            Namaste,{" "}
                            {
                              profile.displayName
                            }
                          </h1>

                          <p className="mt-2 max-w-2xl text-sm leading-6 text-orange-100/85">
                            Maintain your spiritual services, professional information and listing visibility from one place.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            void toggleListing()
                          }
                          className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-orange-900 shadow-sm"
                        >
                          {profile.listingActive ? (
                            <CircleOff
                              size={16}
                            />
                          ) : (
                            <Eye
                              size={16}
                            />
                          )}

                          {profile.listingActive
                            ? "Deactivate Listing"
                            : "Activate Listing"}
                        </button>
                      </div>
                    </section>

                    {(profile.profileStatus !==
                      "approved" ||
                      profile.verificationStatus !==
                        "verified") && (
                      <div className="grid gap-3 md:grid-cols-2">
                        {profile.profileStatus !==
                          "approved" && (
                          <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                            <Clock3
                              className="mt-0.5 shrink-0 text-amber-700"
                              size={18}
                            />

                            <div>
                              <p className="text-sm font-bold text-amber-900">
                                Profile approval:{" "}
                                {
                                  profile.profileStatus
                                }
                              </p>

                              <p className="mt-1 text-xs leading-5 text-amber-800/80">
                                Your profile visibility may be restricted until Admin completes approval.
                              </p>
                            </div>
                          </div>
                        )}

                        {profile.verificationStatus !==
                          "verified" && (
                          <div className="flex gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4">
                            <ShieldCheck
                              className="mt-0.5 shrink-0 text-orange-700"
                              size={18}
                            />

                            <div>
                              <p className="text-sm font-bold text-orange-900">
                                Verification:{" "}
                                {
                                  profile.verificationStatus
                                }
                              </p>

                              <p className="mt-1 text-xs leading-5 text-orange-800/80">
                                Complete the required verification steps when requested by Admin.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      {[
                        {
                          label:
                            "Total Services",
                          value:
                            stats.totalServices,
                          icon: ListChecks,
                        },
                        {
                          label:
                            "Active Services",
                          value:
                            stats.activeServices,
                          icon: CheckCircle2,
                        },
                        {
                          label:
                            "Profile Status",
                          value:
                            profile.profileStatus,
                          icon: BadgeCheck,
                        },
                        {
                          label:
                            "Listing",
                          value:
                            profile.listingActive
                              ? "Live"
                              : "Hidden",
                          icon: Eye,
                        },
                      ].map(
                        (
                          card,
                        ) => {
                          const Icon =
                            card.icon;

                          return (
                            <div
                              key={
                                card.label
                              }
                              className="rounded-3xl border border-orange-900/10 bg-white p-5 shadow-sm"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">
                                  {
                                    card.label
                                  }
                                </p>

                                <span className="grid h-9 w-9 place-items-center rounded-xl bg-orange-50 text-orange-700">
                                  <Icon
                                    size={17}
                                  />
                                </span>
                              </div>

                              <p className="mt-4 truncate text-3xl font-black text-stone-900">
                                {
                                  card.value
                                }
                              </p>
                            </div>
                          );
                        },
                      )}
                    </section>

                    <section className="grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
                      <div className="rounded-3xl border border-orange-900/10 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700">
                              Active Puja Services
                            </p>

                            <h2 className="mt-1 text-xl font-black">
                              Your public offerings
                            </h2>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setTab(
                                "services",
                              )
                            }
                            className="rounded-xl border border-orange-900/10 px-3 py-2 text-xs font-bold text-orange-800 hover:bg-orange-50"
                          >
                            Manage all
                          </button>
                        </div>

                        <div className="mt-4 space-y-3">
                          {activeServices.length ===
                          0 ? (
                            <div className="rounded-2xl bg-orange-50 p-5 text-center">
                              <FileText
                                className="mx-auto text-orange-600"
                                size={24}
                              />

                              <p className="mt-2 text-sm font-bold text-stone-800">
                                No active services yet
                              </p>

                              <button
                                type="button"
                                onClick={
                                  openCreateService
                                }
                                className="btn-saffron mt-3 rounded-xl px-4 py-2 text-xs font-bold text-white"
                              >
                                Add first service
                              </button>
                            </div>
                          ) : (
                            activeServices
                              .slice(
                                0,
                                5,
                              )
                              .map(
                                (
                                  service,
                                ) => (
                                  <div
                                    key={
                                      service.id
                                    }
                                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-orange-900/10 p-4"
                                  >
                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-bold text-stone-800">
                                        {
                                          service.name
                                        }
                                      </p>

                                      <p className="mt-1 text-xs text-stone-500">
                                        {service.durationMinutes
                                          ? `${service.durationMinutes} min · `
                                          : ""}
                                        {displayCurrency(
                                          service.priceAmount,
                                          service.currency,
                                        )}
                                      </p>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        openEditService(
                                          service,
                                        )
                                      }
                                      className="rounded-lg p-2 text-orange-700 hover:bg-orange-50"
                                      title="Edit service"
                                    >
                                      <Edit3
                                        size={16}
                                      />
                                    </button>
                                  </div>
                                ),
                              )
                          )}
                        </div>
                      </div>

                      <div className="rounded-3xl border border-orange-900/10 bg-white p-6 shadow-sm">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700">
                          Quick identity
                        </p>

                        <div className="mt-5 flex items-center gap-4">
                          <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-orange-100 font-black text-orange-800">
                            {profile.photo ? (
                              <img
                                src={
                                  profile.photo
                                }
                                alt={
                                  profile.displayName
                                }
                                className="h-full w-full object-cover"
                                onError={(
                                  event,
                                ) => {
                                  event.currentTarget.style.display =
                                    "none";
                                }}
                              />
                            ) : (
                              profile.displayName
                                .charAt(
                                  0,
                                )
                                .toUpperCase()
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-black">
                              {
                                profile.displayName
                              }
                            </p>

                            <p className="truncate text-xs text-stone-500">
                              {profile.title ||
                                "Pandit"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 space-y-2 text-sm text-stone-600">
                          <p className="flex items-center gap-2">
                            <MapPin
                              size={15}
                              className="text-orange-700"
                            />

                            {profile.city ||
                              "City not set"}

                            {profile.state
                              ? `, ${profile.state}`
                              : ""}
                          </p>

                          <p className="flex items-center gap-2">
                            <Clock3
                              size={15}
                              className="text-orange-700"
                            />

                            {
                              profile.experienceYears
                            }{" "}
                            years experience
                          </p>
                        </div>
                      </div>
                    </section>
                  </div>
                )}
              </>
            )}

            {/* =========================================================
                PROFILE
            ========================================================== */}

            {tab === "profile" && (
              <section className="rounded-3xl border border-orange-900/10 bg-white p-6 shadow-sm md:p-8">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700">
                      {profileMissing
                        ? "Profile CRUD · Create"
                        : "Profile CRUD · Update"}
                    </p>

                    <h1 className="mt-1 text-2xl font-black">
                      {profileMissing
                        ? "Create Pandit profile"
                        : "Pandit profile"}
                    </h1>

                    <p className="mt-1 text-sm text-stone-500">
                      {profileMissing
                        ? "Complete your professional information. Your profile will remain pending until Admin approval."
                        : "Update your professional information stored in the database."}
                    </p>
                  </div>

                  {profile && (
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-black ${statusClass(
                        profile.profileStatus,
                      )}`}
                    >
                      {
                        profile.profileStatus
                      }
                    </span>
                  )}
                </div>

                {profileMissing && (
                  <div className="mt-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <Clock3
                      className="mt-0.5 shrink-0 text-amber-700"
                      size={18}
                    />

                    <div>
                      <p className="text-sm font-bold text-amber-900">
                        Profile setup required
                      </p>

                      <p className="mt-1 text-xs leading-5 text-amber-800/80">
                        Your Pandit account exists, but the professional profile record is missing. Create it below to continue.
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-7 grid gap-5 lg:grid-cols-2">
                  {/* Name */}
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-stone-600">
                      Account name
                    </label>

                    <input
                      className={
                        formInput
                      }
                      value={
                        profileForm.name ??
                        ""
                      }
                      onChange={(
                        event,
                      ) =>
                        setProfileForm(
                          (
                            current,
                          ) => ({
                            ...current,
                            name: event
                              .target
                              .value,
                          }),
                        )
                      }
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-stone-600">
                      Phone
                    </label>

                    <input
                      className={
                        formInput
                      }
                      value={
                        profileForm.phone ??
                        ""
                      }
                      onChange={(
                        event,
                      ) =>
                        setProfileForm(
                          (
                            current,
                          ) => ({
                            ...current,
                            phone: event
                              .target
                              .value,
                          }),
                        )
                      }
                    />
                  </div>

                  {/* Display */}
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-stone-600">
                      Display name
                    </label>

                    <input
                      className={
                        formInput
                      }
                      value={
                        profileForm.displayName ??
                        ""
                      }
                      onChange={(
                        event,
                      ) =>
                        setProfileForm(
                          (
                            current,
                          ) => ({
                            ...current,
                            displayName:
                              event
                                .target
                                .value,
                          }),
                        )
                      }
                    />
                  </div>

                  {/* Title */}
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-stone-600">
                      Professional title
                    </label>

                    <input
                      className={
                        formInput
                      }
                      placeholder="Vedic Pandit · Jyotish Acharya"
                      value={
                        profileForm.title ??
                        ""
                      }
                      onChange={(
                        event,
                      ) =>
                        setProfileForm(
                          (
                            current,
                          ) => ({
                            ...current,
                            title: event
                              .target
                              .value,
                          }),
                        )
                      }
                    />
                  </div>

                  {/* Photo */}
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-stone-600">
                      Photo URL
                    </label>

                    <input
                      className={
                        formInput
                      }
                      placeholder="https://..."
                      value={
                        profileForm.photo ??
                        ""
                      }
                      onChange={(
                        event,
                      ) =>
                        setProfileForm(
                          (
                            current,
                          ) => ({
                            ...current,
                            photo: event
                              .target
                              .value,
                          }),
                        )
                      }
                    />
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-stone-600">
                      Experience (years)
                    </label>

                    <input
                      type="number"
                      min={0}
                      max={100}
                      className={
                        formInput
                      }
                      value={
                        profileForm.experienceYears ??
                        0
                      }
                      onChange={(
                        event,
                      ) =>
                        setProfileForm(
                          (
                            current,
                          ) => ({
                            ...current,
                            experienceYears:
                              event
                                .target
                                .value ===
                              ""
                                ? 0
                                : Math.max(
                                    0,
                                    Math.min(
                                      100,
                                      Number(
                                        event
                                          .target
                                          .value,
                                      ) ||
                                        0,
                                    ),
                                  ),
                          }),
                        )
                      }
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-stone-600">
                      Location
                    </label>

                    <input
                      className={
                        formInput
                      }
                      value={
                        profileForm.location ??
                        ""
                      }
                      onChange={(
                        event,
                      ) =>
                        setProfileForm(
                          (
                            current,
                          ) => ({
                            ...current,
                            location:
                              event
                                .target
                                .value,
                          }),
                        )
                      }
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-stone-600">
                      City
                    </label>

                    <input
                      className={
                        formInput
                      }
                      value={
                        profileForm.city ??
                        ""
                      }
                      onChange={(
                        event,
                      ) =>
                        setProfileForm(
                          (
                            current,
                          ) => ({
                            ...current,
                            city: event
                              .target
                              .value,
                          }),
                        )
                      }
                    />
                  </div>

                  {/* District */}
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-stone-600">
                      District
                    </label>

                    <input
                      className={
                        formInput
                      }
                      value={
                        profileForm.district ??
                        ""
                      }
                      onChange={(
                        event,
                      ) =>
                        setProfileForm(
                          (
                            current,
                          ) => ({
                            ...current,
                            district:
                              event
                                .target
                                .value,
                          }),
                        )
                      }
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-stone-600">
                      State
                    </label>

                    <input
                      className={
                        formInput
                      }
                      value={
                        profileForm.state ??
                        ""
                      }
                      onChange={(
                        event,
                      ) =>
                        setProfileForm(
                          (
                            current,
                          ) => ({
                            ...current,
                            state: event
                              .target
                              .value,
                          }),
                        )
                      }
                    />
                  </div>

                  {/* Country */}
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-stone-600">
                      Country
                    </label>

                    <input
                      className={
                        formInput
                      }
                      value={
                        profileForm.country ??
                        "India"
                      }
                      onChange={(
                        event,
                      ) =>
                        setProfileForm(
                          (
                            current,
                          ) => ({
                            ...current,
                            country:
                              event
                                .target
                                .value,
                          }),
                        )
                      }
                    />
                  </div>

                  {/* Associated */}
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-stone-600">
                      Associated with
                    </label>

                    <input
                      className={
                        formInput
                      }
                      value={
                        profileForm.associatedWith ??
                        ""
                      }
                      onChange={(
                        event,
                      ) =>
                        setProfileForm(
                          (
                            current,
                          ) => ({
                            ...current,
                            associatedWith:
                              event
                                .target
                                .value,
                          }),
                        )
                      }
                    />
                  </div>

                  {/* Arrays */}
                  {(
                    [
                      [
                        "Languages",
                        "languages",
                      ],
                      [
                        "Specializations",
                        "specializations",
                      ],
                      [
                        "Puja types",
                        "pujaTypes",
                      ],
                      [
                        "Service areas",
                        "serviceAreas",
                      ],
                    ] as Array<
                      [
                        string,
                        ArrayField,
                      ]
                    >
                  ).map(
                    ([
                      label,
                      key,
                    ]) => (
                      <div
                        key={
                          key
                        }
                      >
                        <label className="mb-1.5 block text-xs font-bold text-stone-600">
                          {label}{" "}
                          <span className="font-normal">
                            (comma separated)
                          </span>
                        </label>

                        <input
                          className={
                            formInput
                          }
                          value={arrayToCsv(
                            profileForm[
                              key
                            ],
                          )}
                          onChange={(
                            event,
                          ) =>
                            setProfileForm(
                              (
                                current,
                              ) => ({
                                ...current,
                                [key]:
                                  csvToArray(
                                    event
                                      .target
                                      .value,
                                  ),
                              }),
                            )
                          }
                        />
                      </div>
                    ),
                  )}

                  {/* Availability */}
                  <div className="lg:col-span-2">
                    <label className="mb-1.5 block text-xs font-bold text-stone-600">
                      Availability
                    </label>

                    <input
                      className={
                        formInput
                      }
                      placeholder="Mon–Sat · 9 AM–7 PM"
                      value={
                        profileForm.availability ??
                        ""
                      }
                      onChange={(
                        event,
                      ) =>
                        setProfileForm(
                          (
                            current,
                          ) => ({
                            ...current,
                            availability:
                              event
                                .target
                                .value,
                          }),
                        )
                      }
                    />
                  </div>

                  {/* About */}
                  <div className="lg:col-span-2">
                    <label className="mb-1.5 block text-xs font-bold text-stone-600">
                      About
                    </label>

                    <textarea
                      rows={6}
                      maxLength={5000}
                      className={
                        formInput
                      }
                      value={
                        profileForm.about ??
                        ""
                      }
                      onChange={(
                        event,
                      ) =>
                        setProfileForm(
                          (
                            current,
                          ) => ({
                            ...current,
                            about:
                              event
                                .target
                                .value,
                          }),
                        )
                      }
                    />

                    <p className="mt-1 text-right text-[11px] text-stone-400">
                      {
                        (
                          profileForm.about ??
                          ""
                        ).length
                      }{" "}
                      / 5000
                    </p>
                  </div>
                </div>

                <div className="mt-7 flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    disabled={
                      loading.savingProfile
                    }
                    onClick={
                      resetProfileForm
                    }
                    className="rounded-xl border border-orange-900/10 px-5 py-3 text-sm font-bold text-stone-700 hover:bg-orange-50 disabled:opacity-50"
                  >
                    Reset
                  </button>

                  <button
                    type="button"
                    disabled={
                      loading.savingProfile
                    }
                    onClick={() =>
                      void saveProfile()
                    }
                    className="btn-saffron flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-black text-white disabled:opacity-60"
                  >
                    <Save size={16} />

                    {loading.savingProfile
                      ? profileMissing
                        ? "Creating…"
                        : "Saving…"
                      : profileMissing
                        ? "Create Profile"
                        : "Save Profile"}
                  </button>
                </div>
              </section>
            )}

            {/* =========================================================
                SERVICES
            ========================================================== */}

            {tab === "services" && (
              <>
                {!profile ? (
                  <section className="rounded-3xl border border-orange-900/10 bg-white p-8 text-center shadow-sm">
                    <AlertCircle
                      className="mx-auto text-orange-700"
                      size={36}
                    />

                    <h1 className="mt-4 text-2xl font-black">
                      Create your profile first
                    </h1>

                    <p className="mt-2 text-sm text-stone-600">
                      Puja services can be managed after your Pandit profile has been created.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setTab(
                          "profile",
                        )
                      }
                      className="btn-saffron mt-6 rounded-xl px-5 py-3 text-sm font-bold text-white"
                    >
                      Go to Profile
                    </button>
                  </section>
                ) : (
                  <section className="space-y-5">
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700">
                          Full CRUD
                        </p>

                        <h1 className="mt-1 text-2xl font-black">
                          Puja & service offerings
                        </h1>

                        <p className="mt-1 text-sm text-stone-500">
                          Create, read, update, activate/deactivate and delete services stored in SQLite.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={
                          openCreateService
                        }
                        className="btn-saffron flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-black text-white"
                      >
                        <Plus
                          size={17}
                        />
                        Add Service
                      </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="rounded-2xl border border-orange-900/10 bg-white p-5">
                        <p className="text-xs font-bold text-stone-500">
                          Total
                        </p>

                        <p className="mt-2 text-3xl font-black">
                          {
                            stats.totalServices
                          }
                        </p>
                      </div>

                      <div className="rounded-2xl border border-orange-900/10 bg-white p-5">
                        <p className="text-xs font-bold text-stone-500">
                          Active
                        </p>

                        <p className="mt-2 text-3xl font-black text-emerald-700">
                          {
                            stats.activeServices
                          }
                        </p>
                      </div>

                      <div className="rounded-2xl border border-orange-900/10 bg-white p-5">
                        <p className="text-xs font-bold text-stone-500">
                          Inactive
                        </p>

                        <p className="mt-2 text-3xl font-black text-stone-500">
                          {
                            stats.inactiveServices
                          }
                        </p>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-orange-900/10 bg-white shadow-sm">
                      {services.length ===
                      0 ? (
                        <div className="p-10 text-center">
                          <FileText
                            className="mx-auto text-orange-600"
                            size={28}
                          />

                          <h2 className="mt-3 text-lg font-black">
                            No services yet
                          </h2>

                          <p className="mt-1 text-sm text-stone-500">
                            Add your first Puja/service offering.
                          </p>

                          <button
                            type="button"
                            onClick={
                              openCreateService
                            }
                            className="btn-saffron mt-5 rounded-xl px-5 py-3 text-sm font-bold text-white"
                          >
                            Create Service
                          </button>
                        </div>
                      ) : (
                        <div className="divide-y divide-orange-900/10">
                          {services.map(
                            (
                              service,
                            ) => (
                              <div
                                key={
                                  service.id
                                }
                                className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"
                              >
                                <div className="flex min-w-0 gap-4">
                                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-700">
                                    <IndianRupee
                                      size={
                                        18
                                      }
                                    />
                                  </div>

                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h2 className="font-bold text-stone-900">
                                        {
                                          service.name
                                        }
                                      </h2>

                                      <span
                                        className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${
                                          service.isActive
                                            ? "bg-emerald-100 text-emerald-800"
                                            : "bg-stone-100 text-stone-600"
                                        }`}
                                      >
                                        {service.isActive
                                          ? "active"
                                          : "inactive"}
                                      </span>
                                    </div>

                                    <p className="mt-1 line-clamp-2 text-sm text-stone-500">
                                      {service.description ||
                                        "No description"}
                                    </p>

                                    <p className="mt-2 text-xs font-bold text-orange-800">
                                      {displayCurrency(
                                        service.priceAmount,
                                        service.currency,
                                      )}

                                      {service.durationMinutes
                                        ? ` · ${service.durationMinutes} min`
                                        : ""}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 md:shrink-0">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void toggleService(
                                        service,
                                      )
                                    }
                                    className="rounded-xl border border-orange-900/10 px-3 py-2 text-xs font-bold text-stone-700 hover:bg-orange-50"
                                  >
                                    {service.isActive
                                      ? "Deactivate"
                                      : "Activate"}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      openEditService(
                                        service,
                                      )
                                    }
                                    className="rounded-xl border border-orange-900/10 p-2.5 text-orange-700 hover:bg-orange-50"
                                    title="Edit"
                                  >
                                    <Edit3
                                      size={
                                        16
                                      }
                                    />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      void deleteService(
                                        service,
                                      )
                                    }
                                    className="rounded-xl border border-rose-100 p-2.5 text-rose-700 hover:bg-rose-50"
                                    title="Delete"
                                  >
                                    <Trash2
                                      size={
                                        16
                                      }
                                    />
                                  </button>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  </section>
                )}
              </>
            )}

            {/* =========================================================
                VERIFICATION
            ========================================================== */}

            {tab ===
              "verification" && (
              <>
                {!profile ? (
                  <section className="rounded-3xl border border-orange-900/10 bg-white p-8 text-center shadow-sm">
                    <ShieldCheck
                      className="mx-auto text-orange-700"
                      size={38}
                    />

                    <h1 className="mt-4 text-2xl font-black">
                      Profile verification
                    </h1>

                    <p className="mt-2 text-sm text-stone-600">
                      Create your Pandit profile before verification status can be reviewed.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setTab(
                          "profile",
                        )
                      }
                      className="btn-saffron mt-6 rounded-xl px-5 py-3 text-sm font-bold text-white"
                    >
                      Open Profile
                    </button>
                  </section>
                ) : (
                  <section className="space-y-5">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700">
                        Verification & status
                      </p>

                      <h1 className="mt-1 text-2xl font-black">
                        Account readiness
                      </h1>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      {[
                        {
                          label:
                            "Profile approval",
                          value:
                            profile.profileStatus,
                          ok:
                            profile.profileStatus ===
                            "approved",
                          icon: BadgeCheck,
                        },
                        {
                          label:
                            "Verification",
                          value:
                            profile.verificationStatus,
                          ok:
                            profile.verificationStatus ===
                            "verified",
                          icon: ShieldCheck,
                        },
                        {
                          label:
                            "Identity",
                          value:
                            profile.identityVerified
                              ? "Verified"
                              : "Pending",
                          ok:
                            profile.identityVerified,
                          icon: User,
                        },
                        {
                          label:
                            "Profile review",
                          value:
                            profile.profileVerified
                              ? "Verified"
                              : "Pending",
                          ok:
                            profile.profileVerified,
                          icon: CheckCircle2,
                        },
                        {
                          label:
                            "Authorized contact",
                          value:
                            profile.authorizedContact
                              ? "Verified"
                              : "Pending",
                          ok:
                            profile.authorizedContact,
                          icon: Phone,
                        },
                        {
                          label:
                            "Public listing",
                          value:
                            profile.listingActive
                              ? "Live"
                              : "Hidden",
                          ok:
                            profile.listingActive,
                          icon: Eye,
                        },
                      ].map(
                        (
                          item,
                        ) => {
                          const Icon =
                            item.icon;

                          return (
                            <div
                              key={
                                item.label
                              }
                              className="flex items-center justify-between gap-4 rounded-2xl border border-orange-900/10 bg-white p-5 shadow-sm"
                            >
                              <div className="flex items-center gap-3">
                                <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-orange-700">
                                  <Icon
                                    size={
                                      17
                                    }
                                  />
                                </span>

                                <div>
                                  <p className="text-sm font-bold">
                                    {
                                      item.label
                                    }
                                  </p>

                                  <p className="mt-0.5 text-xs text-stone-500">
                                    {
                                      item.value
                                    }
                                  </p>
                                </div>
                              </div>

                              {item.ok ? (
                                <CheckCircle2
                                  className="text-emerald-600"
                                  size={
                                    18
                                  }
                                />
                              ) : (
                                <AlertCircle
                                  className="text-amber-600"
                                  size={
                                    18
                                  }
                                />
                              )}
                            </div>
                          );
                        },
                      )}
                    </div>

                    <div className="rounded-3xl border border-orange-900/10 bg-white p-6 shadow-sm">
                      <div className="flex items-start gap-3">
                        <Settings
                          className="mt-0.5 text-orange-700"
                          size={19}
                        />

                        <div>
                          <h2 className="font-black">
                            Listing control
                          </h2>

                          <p className="mt-1 text-sm leading-6 text-stone-600">
                            Your account can activate its public listing only after Admin approval. Verification flags remain protected from self-editing.
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              void toggleListing()
                            }
                            className="btn-saffron mt-4 rounded-xl px-5 py-3 text-sm font-black text-white"
                          >
                            {profile.listingActive
                              ? "Deactivate Listing"
                              : "Activate Listing"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* ===============================================================
          SERVICE MODAL
      ================================================================ */}

      {serviceModalOpen &&
        profile && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4 backdrop-blur-[2px]">
            <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-[#fffaf5] shadow-2xl">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-orange-900/10 bg-[#fffaf5] px-5 py-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700">
                    Service CRUD
                  </p>

                  <h2 className="mt-1 text-xl font-black">
                    {editingServiceId !==
                    null
                      ? "Edit Puja service"
                      : "Create Puja service"}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={
                    closeServiceModal
                  }
                  className="rounded-xl p-2 text-stone-500 hover:bg-orange-50"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-5 p-5">
                {/* Name */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-stone-600">
                    Service/Puja name
                  </label>

                  <input
                    className={
                      formInput
                    }
                    autoFocus
                    maxLength={180}
                    value={
                      serviceForm.name
                    }
                    onChange={(
                      event,
                    ) =>
                      setServiceForm(
                        (
                          current,
                        ) => ({
                          ...current,
                          name: event
                            .target
                            .value,
                        }),
                      )
                    }
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-stone-600">
                    Description
                  </label>

                  <textarea
                    rows={4}
                    maxLength={1000}
                    className={
                      formInput
                    }
                    value={
                      serviceForm.description ??
                      ""
                    }
                    onChange={(
                      event,
                    ) =>
                      setServiceForm(
                        (
                          current,
                        ) => ({
                          ...current,
                          description:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                  />

                  <p className="mt-1 text-right text-[11px] text-stone-400">
                    {
                      (
                        serviceForm.description ??
                        ""
                      ).length
                    }{" "}
                    / 1000
                  </p>
                </div>

                {/* Price / Currency / Duration */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-stone-600">
                      Price
                    </label>

                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      className={
                        formInput
                      }
                      value={
                        serviceForm.priceAmount ??
                        ""
                      }
                      onChange={(
                        event,
                      ) =>
                        setServiceForm(
                          (
                            current,
                          ) => ({
                            ...current,
                            priceAmount:
                              event
                                .target
                                .value ===
                              ""
                                ? null
                                : Math.max(
                                    0,
                                    Number(
                                      event
                                        .target
                                        .value,
                                    ) ||
                                      0,
                                  ),
                          }),
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-stone-600">
                      Currency
                    </label>

                    <input
                      maxLength={3}
                      className={
                        formInput
                      }
                      value={
                        serviceForm.currency ??
                        "INR"
                      }
                      onChange={(
                        event,
                      ) =>
                        setServiceForm(
                          (
                            current,
                          ) => ({
                            ...current,
                            currency:
                              event
                                .target
                                .value
                                .replace(
                                  /[^a-zA-Z]/g,
                                  "",
                                )
                                .slice(
                                  0,
                                  3,
                                )
                                .toUpperCase(),
                          }),
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-stone-600">
                      Duration (minutes)
                    </label>

                    <input
                      type="number"
                      min={1}
                      max={1440}
                      step={1}
                      className={
                        formInput
                      }
                      value={
                        serviceForm.durationMinutes ??
                        ""
                      }
                      onChange={(
                        event,
                      ) =>
                        setServiceForm(
                          (
                            current,
                          ) => ({
                            ...current,
                            durationMinutes:
                              event
                                .target
                                .value ===
                              ""
                                ? null
                                : Math.max(
                                    1,
                                    Math.min(
                                      1440,
                                      Number(
                                        event
                                          .target
                                          .value,
                                      ) ||
                                        1,
                                    ),
                                  ),
                          }),
                        )
                      }
                    />
                  </div>
                </div>

                {/* Active */}
                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-orange-50 px-4 py-3">
                  <span>
                    <span className="block text-sm font-bold">
                      Active service
                    </span>

                    <span className="block text-xs text-stone-500">
                      Active services can be shown as current offerings.
                    </span>
                  </span>

                  <input
                    type="checkbox"
                    checked={
                      serviceForm.isActive !==
                      false
                    }
                    onChange={(
                      event,
                    ) =>
                      setServiceForm(
                        (
                          current,
                        ) => ({
                          ...current,
                          isActive:
                            event
                              .target
                              .checked,
                        }),
                      )
                    }
                    className="h-5 w-5 accent-orange-700"
                  />
                </label>

                {/* Footer */}
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={
                      closeServiceModal
                    }
                    className="rounded-xl border border-orange-900/10 px-5 py-3 text-sm font-bold text-stone-700 hover:bg-white"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={
                      loading.savingService
                    }
                    onClick={() =>
                      void saveService()
                    }
                    className="btn-saffron flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-black text-white disabled:opacity-60"
                  >
                    <Save size={16} />

                    {loading.savingService
                      ? "Saving…"
                      : editingServiceId !==
                          null
                        ? "Update Service"
                        : "Create Service"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}