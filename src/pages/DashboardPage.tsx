import { useAuth } from '../store/AuthContext'
import HeroSlider from '../components/dashboard/HeroSlider'
import ContinueLearning from '../components/dashboard/ContinueLearning'
import FeaturedCourses from '../components/dashboard/FeaturedCourses'

export default function DashboardPage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="bg-grey-100">
      <div className="layout-frame flex flex-col gap-[64px] pb-[268px] pt-[64px]">
        <HeroSlider />
        {isAuthenticated ? (
          <>
            <ContinueLearning />
            <FeaturedCourses />
          </>
        ) : (
          <>
            <FeaturedCourses />
            <ContinueLearning />
          </>
        )}
      </div>
    </div>
  )
}
