'use client'

import { useState } from 'react'
import { Project } from '@/types/project'
import { ProjectList } from '@/components/ProjectList'
import { createProject, updateProject } from '@/clientCalls/projects'
import { useRouter } from 'next/navigation'
import { Dialog } from '@/components/Dialog'
import { ProjectForm } from '@/components/ProjectForm'

import {useRef} from 'react'


type Props = {
  projects: Project[]
}

export const Projects = ({ projects }: Props) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined)
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects);
  
  const router = useRouter()

  const filterProjects = () => {
    if (inputRef.current) { 
      const filterValue = inputRef.current.value
      if (filterValue === ''){
      const filteredProjects = projects
      setFilteredProjects(filteredProjects)
      }else{
      const filteredProjects = projects.filter((p) => p.user_name === filterValue)
      setFilteredProjects(filteredProjects)
      }
      
    }
  }

  const selectProject = (id: number) => () => {
    setEditingProject(projects.find((p) => p.id === id))
  }

  
  const toggleProject = (id: number) => async () => {
    const p = projects.find((p) => p.id === id)!
    const res = await updateProject({ ...p, active: !p.active})
    if (res.ok) {
      router.refresh()
    }
  }

  const saveProject = async (project: Project) => {
    if (project.id === undefined) {
      const res = await createProject(project)
      if (res.ok) {
        router.refresh()
        setEditingProject(undefined)
      }
    } else {
      const res = await updateProject(project)
      if (res.ok) {
        router.refresh()
        setEditingProject(undefined)
      }
    }
  }
  return (
   <>
     <Dialog open={editingProject !==undefined} close={() => setEditingProject(undefined)}>
       {editingProject !== undefined && <ProjectForm initialValues={editingProject} onSave={saveProject} onCancel={() => setEditingProject(undefined)} />}
     </Dialog>
     <input ref={inputRef} type="text" id="filerInput" name = "filterInput"/>
     <button className="btn-neutral" onClick={filterProjects}>Find by user</button>
     <button className="btn-neutral" onClick={() => setEditingProject({id: undefined, name: '', active: true, user_name: process.env.NEXT_PUBLIC_USERNAME!})}>New</button>
     <ProjectList projects={filteredProjects} onSelect={selectProject} onToggle={toggleProject} />
   </>
  )
}